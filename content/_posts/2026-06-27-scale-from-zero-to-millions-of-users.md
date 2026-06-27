---
layout: post
comments: true
title: Scale from zero to millions of users
categories: [System Design]
description: A guide to scaling a system from zero to millions of users.
---

Một dự án dù nhỏ hay phức tạp điều bắt đầu từ những bước đầu tiên, với những sự tồn tại cơ bản nhất như: web app, database, cache, .... Một mô hình cơ bản được mô tả như sau:

![[Pasted image 20260620122326.png]]

Cốt lõi của việc mang đến việc có thể handle được 1 triệu users nó tuỳ thuộc vào những cách kiến trúc, cấu hình bên trong những thành phần chính này. Việc tối ưu hết mức tuỳ thuộc vào yêu cầu của từng trường hợp, đồng thời là những đánh đối phải đối mặt của những lựa chọn.

Với yêu cầu ở mức tương đối thì việc lựa chọn Vertical scaling (scale up) là một lựa chọn khôn ngoan, nghĩa là sẽ bổ sung thêm sức mạnh (CPU, RAM,...) cho servers, nhưng việc mở rộng đó tồn tại giới hạn do không thể c nâng CPU mỗi khi nó full load, đồng thời tính sẵn sàng sẽ không đáp ứng với cách triển khai single server, đến một lúc thì việc này không còn phù hợp nữa. Lúc này, giải pháp thay thế là Horizontal scaling (scale out), với việc tăng nhiều server thay vì tăng sức mạnh cho single server, sử dụng Load balancing để đảm bảo quá trình phân phối tải chia đều lên các servers ta triển khai, đổi lại chi phí triển khai cũng như vận hành sẽ tốn kém hơn so với scale up.

Load balancing là một công cụ đứng trước các servers, nó sẽ đảm nhận việc phân tích và lựa chọn truy vấn đi vào server nào, nó tuỳ vào thuật toán ta cầu hình, cũng như các logic nghiệp vụ triển khai.

### Database replication

Một cách tối ưu các truy vấn CRUD khi query vào database, nó sẽ triển khai hàng loạt database với những chức năng khác nhau, thường là tồn tại mối quan hệ Master/Slave giữa database chính và database sao chép. Mọi truy vấn vào database với chức năng Create, Update, Delete đều được ghi vào Master, còn Read sẽ được truyền vào các Slave. Cơ chế ghi và đồng bộ được thực hiện tuần tự như sau:

- **Client gửi lệnh ghi:** Ứng dụng gửi lệnh `INSERT INTO users...` tới Master.
- **Master ghi nhật ký (WAL):** Master ghi nhận thay đổi này vào file WAL (lưu trên đĩa), sau đó cập nhật vào Data files của chính nó và trả về thành công cho Client (tuỳ cấu hình).
- **Stream dữ liệu:** Một tiến trình trên Master (gọi là _Wal Sender_) sẽ đọc file WAL này và gửi liên tục các byte dữ liệu qua mạng cho Slave.
- **Slave nạp dữ liệu:** Một tiến trình trên Slave (gọi là _Wal Receiver_) hứng lấy các đoạn WAL này, ghi vào ổ đĩa của Slave, rồi tiến trình _Startup_ của Slave sẽ "re-play" (chạy lại) các lệnh đó để cập nhật data y chang Master.

Quá trình đồng bộ giữa Master và Slave tồn tại 2 kiểu sau: Asynchronous Replication và Synchronous Replication. Bất đồng bộ (Asynchronous) là khi Master ghi xong WAL và Data files ở local thì trả về success ngay cho Client, việc truyền và ghi WAL vào Slave sẽ diễn ra sau. Ngược lại, đồng bộ (Synchronous) yêu cầu Master phải đợi Slave xác nhận (ACK) là đã nhận và ghi WAL xuống đĩa thành công thì Master mới trả về success cho Client (không đợi Slave re-play xong để tránh nghẽn). Mặc định thường dùng là Asynchronous Replication để tối ưu tốc độ, nhưng nhược điểm là nếu Master chết trước khi WAL kịp gửi sang Slave thì dữ liệu sẽ bị mất.

**Với trường hợp database Master die thì sao?? Nó sẽ có những cách fallbacks gì??**

> Lúc này nó sẽ đóng bănh hoàn toàn Master để tránh trường hợp nó sống dậy và gây xung đột dữ liệu, sau đó sẽ bắt đầu promote một Slave lên làm Master mới, lúc này sẽ mở quyền read-write, điều hướng tất cả lệnh trỏ về Master mới. Và khi con Master cũ sống lại thì nó sẽ được đóng vai trò là một Slave.

### Cache

Một bộ nhớ tạm thời các dữ liệu có tần suất truy cập nhiều, mang lại tốc độ cao với những request thường hay sử dụng.

![[Pasted image 20260621104011.png|709]]

Những căn nhắc sử dụng cache:

- Dữ liệu có tấn suất READ cao, nhưng tuần suất thay đổi lại thấp.
- Thời gian hết hạn, điều bắt buộc phải sử dụng đối với cache. Khi hết hạn, key đó sẽ được xoá khỏi cache. Khi có truy vấn (Cache Miss), ứng dụng sẽ không lấy được từ cache, thay vào đó ứng dụng phải tự query vào database để lấy dữ liệu, sau đó ghi ngược lại vào cache (mô hình Cache-Aside). Cần xem xét đặt thời gian hết hạn phù hợp, quá ngắn làm tăng tải database, quá dài gây sai lệch dữ liệu.
- Đảm bảo tính nhất quán, luôn giữ cho cache và database luôn được đồng bộ với nhau, tránh việc sai sót khi read dữ liệu.
- Giảm thiểu failures: Tránh Single Point of Failure (SPOF). Một cache server duy nhất sập sẽ dẫn đến toàn bộ traffic dồn thẳng vào database, làm sập luôn database (hiện tượng Cache Avalanche). Việc tăng RAM/CPU chỉ chống quá tải (OOM), không chống được sập server/mất mạng. Giải pháp là triển khai Redis Sentinel (Failover) hoặc Redis Cluster (Phân tán).
- Chính sách trục xuất: Nếu hệ thống cache bị tràn bộ nhớ, việc thiết lập các thuật toán để xoá key cũ là cần thiết. Thông dụng nhất là **LRU (Least Recently Used - Xoá key ít được truy cập gần đây nhất)**, ngoài ra tuỳ ngữ cảnh có thể dùng LFU (Least Frequently Used) hoặc FIFO (First In First Out).

### Content delivery network (CDN)

Một mạng lưới các máy chủ phân tán về mặt địa lý cung cấp các nội dụng tĩnh, giúp người dùng truy cập đến trang web, máy chủ CDN gần người dùng nhất sẽ cung cấp các nội dung tĩnh, sẽ giúp tối ưu hơn về thời gian so với server chính do độ trễ về khoảng cách giữa người dùng so với CDN và người dùng so với server chính.

![[Pasted image 20260622171906.png]]

Ngoài ra, phải triển khai theo cơ chế fallback để đảm bảo nếu CDN không tồn tại thì sẽ truy cập đến server chính.
![[Pasted image 20260622172007.png]]

Những cân nhắc khi sử dụng CDN:

- Chi phí: Thường sẽ được triển khai ở nền tảng thứ 3, nó quyết định vào dữ liệu triền ra và vào đối với CDN, nên cần cân nhắc sử dụng những dữ liệu thường hay sử dụng để đảm bảo tài nguyên không bị hoang phí.
- Thiết lập thời gian hết hạn đối với dữ liệu, cần thiết lập một số hợp lí, tránh việc quá dài khiến dữ liệu không còn mới và quá ngắn khiến việc cập nhật liên tục không cần thiết.
- Thiết lập fallback để đảm bảo truy vấn đến origin nếu CDN không hỗ trợ.
- Cập nhật CDN khi dữ liệu ở origin thay đổi: Có thể sử dụng các API từ bên nhà cung cấp dịch vụ hoặc đánh số phiên bản (version) lên file.

### Stateless web tier

Một kiến trúc thiết kế mạng mà trong đó mỗi request (yêu cầu) từ client (trình duyệt) gửi lên server đều hoàn toàn độc lập và không phụ thuộc vào bất kỳ request nào trước đó. Nó là điều kiện lý tưởng để cân nhắc sử dụng horizontal scale.

Stateful architecture là một dạng thiết kế mà hệ thống sẽ lưu lại session của user, điều này bắt buộc user A xác thực ở Server 1 thì những lần sau cần phải được đính với Server 1 để đảm bảo truy cập được cho phép do chỉ mỗi Server đó tồn tại thông tin session. Nó sẽ là một thách thức với trường hợp phình to ở một server nhất định.

![[Pasted image 20260622175025.png]]

Stateless architecture là một dạng thiết kế ngược lại với trường hợp trên, mỗi truy vấn đề có thể thực hiện ở tất cả server, do nó được thiết kế không lưu lại session từ người dùng, trường hợp này lý tưởng và giúp ta chia tải giữa các server.
![[Pasted image 20260622180724.png|467]]

Đó là lý do tại sao việc horizontal scale sẽ nhẹ nhàng hơn rất nhiều khi ta dùng NoSQL, vì nó bản chất nó mỗi record nó được định danh là một mã hash và tồn tại cơ chế sharding tự động. Do tính chất độc lập nên việc triển khai đơn giản chỉ là thêm server và thêm vào cluster.

Nhưng nếu bắt buộc dùng SQL và yêu cầu horizontal scale thì mình có những giải pháp như sau:

- Database replicate: Chỉ giải quyết được bài toán phân tải READ (Scale READ). Khi hệ thống phình to dữ liệu hoặc có lượng WRITE khổng lồ, Master vẫn là nút thắt cổ chai vì phải gánh 100% WRITE và stream WAL cho tất cả Slave.
- Database sharding: Phân tán dữ liệu ra nhiều server dựa trên một khóa (ví dụ: shard theo khoảng ID). Tuy nhiên đánh đổi là phức tạp hoá logic ứng dụng và mất khả năng JOIN liên server.
- Migrate sang NewSQL, một loại database mới có cơ chế auto-sharding nhưng vẫn tồn tại các mối quan hệ giữa các bảng.
- Kiến trúc Microservice: Chia nhỏ ứng dụng theo domain (chia để trị), mỗi service quản lý database riêng. Đánh đổi là phải thay đổi kiến trúc code và quản lý Distributed Transaction (Saga/2PC).

Mô hình tổng quan của một hệ thống được thiết kế tối ưu

![[Pasted image 20260622190656.png|564]]

### Data center

Triển khai nhiều data center nhầm mạng lại thời gian phản hồi cao cho từng vùng trên thế giới dành cho web/app toàn cầu là một giải pháp tốt. Thay vì người dùng mỗi lần truy cập vào web phải gửi đến server ở Mỹ thì lần này nó sẽ được gửi về Singapo, mang lại trải nghiệm về tốc độ phản hồi.

![[Pasted image 20260625152233.png]]

Cách cấu hình để nó tự động truy cập và data center tối ưu nhất là bước đầu ta cần phải trỏ Name Server về dịch vụ DNS có hỗ trợ GeoDNS, sau đó vào trang của bên cung cấp dịch vụ để thêm các record kèm theo các điều kiện địa lý và health check tương ứng.

Lúc này, khi browser truy cập vào trang web qua domain, nó sẽ được trỏ về DNS server để giải mã về IP tương ứng, sau đó GeoDNS sẽ hoạt động, và xác nhận vị trí địa lí theo IP người dùng và healthcheck để tra về IP của data center phù hợp nhất.

Lý do triển khai kèm theo điều kiện health check để đảm bảo tính sẵn sàng của hệ thống bằng cách thêm các điều kiện fallback cho các data center. Nếu data center gần nhất chết, GeoDNS sẽ trả về IP của data center dự phòng. **Tuy nhiên**, cần lưu ý rủi ro về DNS Cache: Các trình duyệt và ISP (nhà mạng) lưu lại IP theo thời gian TTL (Time To Live). Trong lúc TTL chưa hết hạn, DNS đổi IP thì user vẫn truy cập vào IP cũ bị chết.

![[Pasted image 20260625153044.png]]

Nhưng việc mở rộng nhiều data centers với nhiều vị trí khác nhau, tồn tại một vài thử thách là làm thế nào để giải quyết data/cache của người dùng được đồng bộ ở tất cả các data center, nhầm tránh trường hợp data center A, nơi người dùng hay truy cập bảo trì, khiến fallback trả về data center B, và người dùng không tồn tại thông tin đăng nhập gì liên quan tại data center tại đây. [Giải pháp là triển khai multi-data center replication của Netflix.](https://netflixtechblog.com/active-active-for-multi-regional-resiliency-c47719f6685b?gi=953e71cd5f41)

### Message queue

Là một bộ nhớ đệm, nó giúp phân phối các requests không đồng bộ. Kíến trúc của một hệ thống message queue đơn giản gồm 2 thành phần chính input services gọi là producer/publisher, nó có chức năng tạo và thêm message. Và một cái nữa được gọi là consumers/subscribers, nó được kết nối với queue, và thực hiện các hành động được định nghĩa trong messages.

![[Pasted image 20260625173432.png]]

Trong đó,  producer và consumer có thể mở rộng một cách độc lặp, và phần lớn sử dụng nhiều tài nguyên và quyết định tốc độ phụ thuộc và logic và tài nguyên có sẵn của worker nằm ở nằm ở consumer . Nên việc cấu hình phù hợp sẽ mạng lại hiểu quả cao nhất cho một message queue. Lựa chọn bổ sung và giảm bớt số lượng worker tuỳ vào lượng message tại thời điểm đó, việc tăng lượng worker giúp việc thực hiện nhanh, và giảm giúp tránh việc các worker được khởi tạo nhưng không có jobs thực hiện.

![[Pasted image 20260625174305.png]]

### Logging, metrics, automation

Khi dự án ở mức nhỏ, chỉ đơn giảm là một website nhỏ, được host trên một server nhỏ thì việc triển khai logging, metrics, và tự động hỗ trợ là một giải pháp tốt nhưng nó không cần thiết. Nhưng với mô hình doanh nghiệp lớn, với quy mô lớn thì việc đầu tư hệ thống đó là hoàn toàn sáng suốt.

Giúp ta nhận biết được các error logs quan trọng, giúp ta nhận định được các vấn đề hiện tại hoặc là phát hiện được các bugs tiềm ẩn có thể xuất hiện. Ngoài ra, tập hợp các thông số chi tiết về hệ thống, giúp ta đánh giá tính trạng sức khoẻ hiện tại, để đưa ra các giải pháp phù hợp.

Còn với về automation tools,  nó là một phần không thể thiếu giúp tự động hoá các hành động được sử dụng lặp đi lặp lại nhiều lần, và những hành động không thể bỏ qua trong luồng CI/CD chẳng hạn.

Hệ thống sau khi bổ sung thêm message queue và các tools liên quan đế loggings, metrics và automation

![[Pasted image 20260625175634.png]]

### Database scaling

Như những vấn đề có thể gặp được chia sẻ ở những chủ đề phía trên khi scale up và scale out. Vấn đề thấy rõ nhất của scale up là đụng trần về các thông số phần cứng, và còn với scale out thì sẽ gặp phải các vấn đề liên quan đến sharding data giữa các database.

Logic cơ bản trong việc scale out của database là chia đều các records ra từng shard (phân vùng) dựa trên một khóa. Ví dụ có 4 shards, công thức cơ bản là lấy modulo `user_id % 4` để ra vị trí shard (0 đến 3). Tuy nhiên, khi hệ thống phình to và tăng lên 5 shards, công thức thành `user_id % 5`. Việc này dẫn đến kết quả vị trí shard của hầu hết records bị thay đổi hoàn toàn (Rehashing problem), bắt buộc phải migrate lại gần như toàn bộ database, gây sập hệ thống. Các giải pháp thay thế:
- Dùng consistent hasing: Khi thêm shard (thứ 5, thứ 6), chỉ một lượng nhỏ dữ liệu của các shards lân cận bị chuyển đi, giữ cho hệ thống ổn định và không cần migrate toàn bộ DB.
- Dùng bảng mapping: Sử dụng một database hoặc cache, yêu cầu truy vấn trước để lấy được vị trí xác định của query đó nằm ở shard nào.
- Distributed SQL: ưu tiên thiết kế phân tán ngay từ đầu nhưng vấn tồn tại các mối quan hệ giữa các table trong SQL, lúc này sẽ tận dụng được auto-sharding nhưng vấn tồn tại các tính chất vốn có của SQL.

Từ những trade-off được đưa ra ở trên, ta có thể thấy việc ban đầu lựa chọn NoSQL sẽ hoàn toàn giải quyết được các vấn đề trên. Nhưng nó cũng sẽ tồn tại một vài vấn đề ta cần phải thoả mãn để tránh việc tin vào những lợi ích trước mắt:
- Mất đi Join và ACID chặt chẽ vốn có của SQL
- Các thiết kế schema: Tư duy làm NoSQL nó khác hoàn toàn với SQL. Thay vì chuẩn hóa (chia ra nhiều bảng để tránh trùng lặp), ta phải tư duy theo kiểu phi chuẩn hóa (Denormalization) – nhét chung dữ liệu vào một Document (ví dụ nhét luôn list comments vào trong bài post). Nếu lấy tư duy thiết kế bảng của SQL đập sang NoSQL, performance sẽ toang nặng.
Tóm lại, nếu bài toán của ní là cần lưu trữ lượng dữ liệu khổng lồ, tần suất Read/Write cực cao, và dữ liệu mang tính chất độc lập (ví dụ: log hệ thống, tracking sự kiện, tin nhắn chat, thông tin IoT) thì NoSQL là chân ái.

![[Pasted image 20260625190953.png]]

### Kết luận
Mở rộng hệ thống là một quá trình lặp đi lặp lại, việc tính toán nhiều khía cạnh, cân bằng giữa các trade-off sẽ giúp ta tối ưu được một hệ thống với lượng tải cao. Tổng kết những vấn đề ta được đề cập trong chương này:
- Luôn hướng đến triển khai theo web tier stateless
- Xây dựng các kế hoạch dự phòng (fallback) cho từng vòng
- Sử dụng cache phù hợp cho từng trường hợp
- Xây dựng hệ thống đa data centers
- Host static assets với CDN
- Database scaling
- Phân chia thành các service độc lập
- Giảm sát hệ thống và các automation tools.

