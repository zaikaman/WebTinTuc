import type { Article, CategoryFeed } from "@/lib/types/news";

export function getCategorySlug(category: string): string {
  const norm = category.toLowerCase().trim();
  if (norm.includes("tin tức") || norm.includes("tin-tuc")) return "tin-tuc";
  if (norm.includes("anime") || norm.includes("manga")) return "anime-manga";
  if (norm.includes("công nghệ") || norm.includes("cong-nghe") || norm.includes("gear")) return "cong-nghe";
  if (norm.includes("phim") || norm.includes("film")) return "phim";
  if (norm.includes("kiến thức") || norm.includes("kien-thuc")) return "kien-thuc";
  return "tin-tuc";
}

export const mockArticles: Article[] = [
  // Oc Muon Hon Movie Article
  {
    id: "oc-muon-hon-poster",
    title: "Ốc Mượn Hồn tung dàn poster nhân vật cực chất",
    category: "Phim",
    time: "27/05/2026 9:14",
    image: "/oc_muon_hon_poster.png",
    badge: "Phim",
    intro: "Phim điện ảnh kinh dị kì bí 'Ốc Mượn Hồn' vừa tung bộ poster nhân vật chính thức hé lộ những tạo hình đầy ma mị và ám ảnh của dàn diễn viên tên tuổi.",
    content: [
      {
        type: "paragraph",
        text: "Dự án phim điện ảnh 'Ốc Mượn Hồn' đang là tâm điểm chú ý của khán giả yêu thích thể loại kinh dị giật gân tại Việt Nam. Mới đây, nhà phát hành đã chính thức tung ra bộ poster nhân vật cực chất, hé lộ tạo hình ấn tượng của nhân vật nữ chính bên cạnh chiếc vỏ ốc mượn hồn khổng lồ đầy bí ẩn."
      },
      {
        type: "image",
        src: "/oc_muon_hon_poster.png",
        caption: "Tạo hình ma mị đầy ám ảnh của nữ chính bên cạnh vỏ ốc mượn hồn cổ xưa"
      },
      {
        type: "paragraph",
        text: "Bộ phim xoay quanh câu chuyện về một gia đình dọn đến căn biệt thự cổ ven biển, nơi họ vô tình tìm thấy những chiếc vỏ ốc mang lời nguyền tà ác từ hàng trăm năm trước. Mỗi nhân vật trong phim đều mang những góc khuất tâm lý phức tạp, hứa hẹn sẽ mang đến những màn rượt đuổi nghẹt thở và những cú twist bất ngờ."
      }
    ]
  },
  // Hanoi Heatwave Article (from the screenshots)
  {
    id: "hanoi-nang-nong-38-7",
    title: "Hà Nội ghi nhận mức nhiệt cao nhất cả nước: Trung tâm Thủ đô nóng ngột ngạt khó thở, người dân vật vã giữa \"chảo lửa\" 38,7 độ C",
    category: "Tin tức",
    time: "24/05/2026 15:18",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop",
    badge: "Tin tức",
    intro: "Dự báo thời tiết ngày 24/5/2026, miền Bắc và Trung Bộ bước vào đợt cao điểm nắng nóng gay gắt, có nơi trên 40 độ. Giữa thời tiết nắng nóng gay gắt, người đi đường và công nhân xây dựng phải che chắn kín mít, mang theo nước mát để chống chọi cái nóng ngoài trời.",
    content: [
      {
        type: "paragraph",
        text: "Những ngày gần đây, Hà Nội cùng nhiều tỉnh miền Bắc đang bước vào đợt nắng nóng gay gắt nhất từ đầu mùa hè. Ngay từ sáng sớm, những tia nắng đã hắt xuống mặt đường bỏng rát, khiến không khí trở nên oi bức, ngột ngạt. Đến giữa trưa, nền nhiệt tăng cao khiến nhiều tuyến phố như chìm trong hơi nóng hầm hập bốc lên từ mặt đường nhựa và các khối bê tông san sát."
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1568051243851-f9b136146e97?q=80&w=600&auto=format&fit=crop",
        caption: "Nhiệt độ ngoài trời tăng cao, người đi đường kín mít giữa ngã tư không một bóng cây"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop",
        caption: "Riêng thời tiết Hà Nội ngày 24/5, nắng nóng gay gắt với nhiệt độ cao nhất trên 38 độ. Thời gian xuất hiện nắng nóng, có nhiệt độ cao hơn 35 độ là từ 13-15h hàng ngày."
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop",
        caption: "Nhiều người chạy xe máy dừng dưới bóng râm cầu vượt để tránh cái nắng gay gắt"
      },
      {
        type: "ad" // QC 650x300 will be rendered here
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop",
        caption: "Ngã tư giữa trưa nắng gắt, mặt đường hầm hập hơi nóng"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop",
        caption: "Một tài xế xe công nghệ che chắn kín mít trong lúc chở khách, chỉ để lộ đôi mắt"
      },
      {
        type: "paragraph",
        text: "Theo ghi nhận trong ngày hôm qua, nắng nóng bao trùm hầu khắp cả nước, trong đó khu vực Láng (Hà Nội) ghi nhận mức nhiệt cao nhất lên tới 38,7 độ C trong lều khí tượng. Tuy nhiên, nhiệt độ thực tế ngoài trời mà người dân phải hứng chịu còn cao hơn rất nhiều."
      },
      {
        type: "paragraph",
        text: "Dưới cái nắng như thiêu đốt, nhiều người phải che kín từ đầu đến chân khi ra đường. Những công nhân lao động ngoài trời, người bán hàng rong hay shipper vẫn miệt mài mưu sinh giữa nền nhiệt khắc nghiệt. Trên các tuyến phố, mặt đường nóng hầm hập, hơi nóng phả lên bỏng rát khiến ai cũng chỉ muốn nhanh chóng tìm một nơi có bóng râm hoặc điều hòa để tránh nóng."
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1517224480-1a6d36e2f1d9?q=80&w=600&auto=format&fit=crop",
        caption: "Người đi đường cố gắng che chắn giữa cái nắng gay gắt hất thẳng vào mặt"
      },
      {
        type: "paragraph",
        text: "Đợt nắng nóng kéo dài không chỉ ảnh hưởng đến sinh hoạt hằng ngày mà còn làm gia tăng nhu cầu sử dụng điện, nước của người dân. Dự báo trong những ngày tới, khu vực miền Bắc vẫn tiếp tục duy trì nền nhiệt cao, thời tiết oi bức còn kéo dài."
      },
      {
        type: "paragraph",
        text: "Cơ quan khí tượng nhận định, nắng nóng ở Bắc Bộ có khả năng kéo dài đến khoảng ngày 27-28/5, ở Trung Bộ đến khoảng ngày 28/5, ở miền Đông Nam Bộ đến ngày 27/5. Khoảng đêm 28 và ngày 29/5, Hà Nội mưa giông, kết thúc đợt nắng nóng."
      },
      {
        type: "ad" // Second QC 650x300 ad block at the bottom
      }
    ]
  },
  // Related Articles (Left column recommendation)
  {
    id: "related-1",
    title: "Mở trend thịt phơi nắng ngày Hà Nội chạm ngưỡng 40 độ C: Bất ngờ với kết quả sau 1 ngày",
    category: "Tin tức",
    time: "27/05/2026 9:14",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "related-2",
    title: "Văn hóa self-care độc hại là gì?",
    category: "Tin tức",
    time: "26/05/2026 12:04",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "related-3",
    title: "Hàng loạt brand \"đóng cửa\" trên Instagram: Chuyện gì đang xảy ra?",
    category: "Tin tức",
    time: "26/05/2026 12:04",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "related-4",
    title: "JVevermind bất ngờ trở thành Tổng Giám đốc hãng phim của Vingroup",
    category: "Tin tức",
    time: "25/05/2026 23:00",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"
  },
  // You might also like (Right column recommendation)
  {
    id: "like-1",
    title: "Không thể ngăn cản Doraemon",
    category: "Anime/manga",
    time: "27/05/2026 10:27",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "like-2",
    title: "Kịch bản tranh cãi vẫn ôm trăm tỷ: Phim Việt thắng nhờ “chiêu trò”?",
    category: "Phim",
    time: "26/05/2026 12:04",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "like-3",
    title: "Phép màu từ thế giới ảo: Khi nhân vật anime bước ra đời thực để cứu rỗi tâm hồn một bé gái",
    category: "Anime/manga",
    time: "26/05/2026 12:04",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "like-4",
    title: "Galaxy S27 Pro: ‘Quái vật mini’ mới sở hữu DNA của bản Ultra",
    category: "Công nghệ",
    time: "27/05/2026 12:45",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop"
  },
  // Homepage Featured articles
  {
    id: "featured-1",
    title: "Vừa ra mắt, tựa game Soulslike mới trên Steam đã nhận rating 97% tích cực, phong cách chơi cực sáng tạo",
    category: "Game Steam",
    time: "2 giờ trước",
    image: "/soulslike_game.png",
    badge: "Game Steam"
  },
  {
    id: "featured-2",
    title: "Hào hứng trải nghiệm beta sớm của GTA 6, hàng loạt game thủ nhận cái kết \"trong mơ cũng không nghĩ tới\"",
    category: "GTA 6",
    time: "1 giờ trước",
    image: "/gta6_beta.png",
    badge: "GTA 6"
  },
  {
    id: "featured-3",
    title: "HLE vào nhánh thắng Road to MSI 2026 nhưng cũng khiến fan dấy lên nỗi lo",
    category: "Liên Minh Huyền Thoại",
    time: "3 giờ trước",
    image: "/esports_news.png",
    badge: "Liên Minh Huyền Thoại"
  },
  {
    id: "featured-4",
    title: "Video Trần Hà Linh bị \"giật tóc\" thu hút gần 8 triệu lượt xem, CĐM tò mò đi tìm nguyên nhân",
    category: "Đời sống",
    time: "5 giờ trước",
    image: "/video_news.png"
  },
  // Main Articles
  {
    id: "main-1",
    title: "Anime mùa hè 2026: Top những bộ không thể bỏ qua",
    category: "ANIME/MANGA",
    time: "1 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "main-2",
    title: "Tựa game bắn súng sinh tồn mobile mở đợt thử nghiệm thứ 2 cực hot",
    category: "GAME MOBILE",
    time: "3 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "main-3",
    title: "Thế hệ card đồ họa tiếp theo hứa hẹn tăng gấp đôi hiệu năng xử lý AI",
    category: "CÔNG NGHỆ",
    time: "5 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "main-4",
    title: "Bom tấn rạp chiếu phim đạt doanh thu kỷ lục chỉ sau 3 ngày ra mắt",
    category: "PHIM/FILM",
    time: "6 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "main-5",
    title: "Trên tay bàn phím cơ hot-swap giá rẻ đáng mua nhất phân khúc giá rẻ",
    category: "GAMING GEAR",
    time: "8 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "main-6",
    title: "Group game thủ chia sẻ hàng loạt bí mật giấu kín suốt 10 năm qua",
    category: "CỘNG ĐỒNG",
    time: "10 giờ trước",
    image: "/placeholder.svg"
  },
  // Category Articles - Anime
  {
    id: "anime-1",
    title: "One Piece chương mới: Bí ẩn kho báu thế giới cổ đại dần hé lộ",
    category: "ANIME/MANGA",
    time: "30 phút trước",
    image: "/placeholder.svg"
  },
  {
    id: "anime-2",
    title: "Sát Thủ Diệt Quỷ phần tiếp theo chính thức khởi chiếu tại cụm rạp",
    category: "ANIME/MANGA",
    time: "2 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "anime-3",
    title: "Bảng xếp hạng manga bán chạy nhất nửa đầu năm 2026",
    category: "ANIME/MANGA",
    time: "4 giờ trước",
    image: "/placeholder.svg"
  },
  // Category Articles - Tech
  {
    id: "tech-1",
    title: "Thử nghiệm chip xử lý di động mới nhất trên các game đồ họa nặng",
    category: "CÔNG NGHỆ",
    time: "1 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "tech-2",
    title: "Có nên nâng cấp lên chuẩn RAM thế hệ mới ở thời điểm hiện tại?",
    category: "CÔNG NGHỆ",
    time: "3 giờ trước",
    image: "/placeholder.svg"
  },
  {
    id: "tech-3",
    title: "Tốc độ đọc ghi ổ cứng SSD thế hệ thứ 5 đạt kỷ lục ấn tượng",
    category: "CÔNG NGHỆ",
    time: "5 giờ trước",
    image: "/placeholder.svg"
  }
];

// Helper to generate dynamic placeholder content for articles that don't have detailed bodies
export function getOrGenerateArticle(id: string): Article | undefined {
  const article = mockArticles.find(a => a.id === id);
  if (!article) return undefined;

  // If the article already has content (like the Hanoi Heatwave article), return it as is.
  if (article.content && article.content.length > 0) {
    return article;
  }

  // Otherwise, let's dynamically generate a realistic post content structure based on its category/title.
  const category = article.category.toUpperCase();
  let intro = `Đây là tin tức mới nhất về chủ đề ${article.category.toLowerCase()}. Bài viết cung cấp góc nhìn sâu sắc và cập nhật những diễn biến mới nhất đang thu hút sự quan tâm lớn của độc giả và cộng đồng mạng trong những ngày qua.`;
  
  let paragraphs: string[] = [];
  let images: { src: string; caption: string }[] = [];

  if (category.includes("ANIME") || category.includes("MANGA")) {
    intro = `Mùa phim mới đang chứng kiến sự trỗi dậy của hàng loạt siêu phẩm ${article.category.toLowerCase()} đình đám. Dưới đây là ghi nhận chi tiết về phản ứng của người hâm mộ cùng những đánh giá chuyên môn mới nhất về tác phẩm đang gây bão này.`;
    paragraphs = [
      "Theo thông tin mới nhận, cốt truyện của phần phim/truyện này đang đạt đến cao trào với sự xuất hiện của những nhân vật cực kỳ ấn tượng. Các diễn đàn thảo luận lớn liên tục tràn ngập các bài phân tích chi tiết về từng khung hình và lời thoại.",
      "Đội ngũ sản xuất cho biết họ đã dành ra rất nhiều tháng để trau chuốt phần hình ảnh và âm thanh nhằm đem lại trải nghiệm tốt nhất. Điều này lý giải tại sao lượng đĩa bán ra cũng như lượt xem trực tuyến liên tục phá kỷ lục.",
      "Với những tín hiệu tích cực hiện tại, dự án chắc chắn sẽ tiếp tục thống trị các bảng xếp hạng trong thời gian tới. Người hâm mộ hiện đang rất ngóng chờ những hé lộ tiếp theo từ tác giả."
    ];
    images = [
      {
        src: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
        caption: "Hình ảnh phác thảo nhân vật chính được cộng đồng chia sẻ rộng rãi"
      },
      {
        src: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
        caption: "Cảnh phim ấn tượng với hiệu ứng ánh sáng và chuyển động mượt mà"
      }
    ];
  } else if (category.includes("CÔNG NGHỆ") || category.includes("GEAR")) {
    intro = `Thị trường thiết bị và giải pháp công nghệ vừa chứng kiến một bước nhảy vọt quan trọng. Sự xuất hiện của thông tin mới này hứa hẹn sẽ định hình lại xu hướng lựa chọn của người tiêu dùng trong thời gian tới.`;
    paragraphs = [
      "Nhiều chuyên gia công nghệ nhận định rằng những nâng cấp trong đợt ra mắt này giải quyết triệt để các vấn đề hiệu năng của thế hệ tiền nhiệm. Các thử nghiệm benchmark thực tế cho kết quả vượt ngoài kỳ vọng ban đầu của đội ngũ phát triển.",
      "Về mặt thiết kế và chất liệu, sản phẩm mang lại cảm giác cực kỳ sang trọng và độ bền vượt trội. Mức giá bán dự kiến cũng được đánh giá là vô cùng cạnh tranh so với các đối thủ cùng phân khúc.",
      "Người dùng đang bày tỏ sự hào hứng lớn và đã bắt đầu đặt hàng trước tại nhiều hệ thống bán lẻ lớn. Chúng tôi sẽ tiếp tục thực hiện các bài đánh giá chi tiết trải nghiệm sử dụng thực tế trong vài ngày tới."
    ];
    images = [
      {
        src: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
        caption: "Cận cảnh bảng mạch và các thành phần linh kiện cao cấp bên trong thiết bị"
      },
      {
        src: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop",
        caption: "Thiết kế hiện đại, tinh gọn phù hợp với xu hướng tối giản hiện nay"
      }
    ];
  } else if (category.includes("GAME") || category.includes("GTA") || category.includes("LIÊN MINH") || category.includes("MSI")) {
    intro = `Cộng đồng game thủ đang xôn xao trước thông tin cực hot liên quan trực tiếp đến dự án game đình đám này. Đây được coi là sự kiện đáng chú ý nhất trong tuần đối với những ai đam mê trò chơi điện tử.`;
    paragraphs = [
      "Ngay sau khi những hình ảnh đầu tiên hoặc bản thử nghiệm được công bố, lượng người truy cập máy chủ đã tăng vọt ngoài tầm kiểm soát. Nhà phát hành đã phải ngay lập tức tiến hành nâng cấp hạ tầng để đáp ứng nhu cầu khổng lồ.",
      "Lối chơi sáng tạo cùng hệ thống đồ họa tối tân chính là điểm sáng giúp tựa game ghi điểm tuyệt đối trong mắt giới phê bình. Bên cạnh đó, các chế độ chơi phối hợp đồng đội cũng mang lại những trải nghiệm mới mẻ chưa từng có.",
      "Các giải đấu chuyên nghiệp dự kiến cũng sẽ sớm đưa nội dung này vào thi đấu chính thức. Hãy cùng chờ đợi xem các tuyển thủ hàng đầu sẽ khai thác những chiến thuật gì từ bản cập nhật mới này."
    ];
    images = [
      {
        src: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
        caption: "Trải nghiệm đồ họa rực rỡ và chân thực trên dòng máy cấu hình cao"
      },
      {
        src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        caption: "Giải đấu Esports chuyên nghiệp thu hút hàng vạn khán giả theo dõi trực tiếp"
      }
    ];
  } else {
    // General fallback
    paragraphs = [
      "Theo các nguồn tin uy tín, sự kiện này đang thu hút sự chú ý cực kỳ lớn của dư luận với hàng triệu lượt tương tác trên mạng xã hội. Nhiều người bày tỏ sự đồng tình và chia sẻ những câu chuyện tương tự liên quan.",
      "Cơ quan chức năng và các đơn vị liên quan cũng đã nhanh chóng vào cuộc để xác minh và đưa ra những khuyến cáo kịp thời đến người dân. Mọi diễn biến mới nhất sẽ được cập nhật liên tục để quý độc giả tiện theo dõi.",
      "Hy vọng rằng vấn đề sẽ sớm được giải quyết ổn thỏa, đem lại sự an tâm cho cộng đồng. Dưới đây là những tổng hợp và ghi nhận thực tế từ phóng viên của chúng tôi tại hiện trường."
    ];
    images = [
      {
        src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=600&auto=format&fit=crop",
        caption: "Không khí thảo luận sôi nổi xung quanh sự kiện đang diễn ra"
      },
      {
        src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop",
        caption: "Sự kiện thu hút đông đảo sự quan tâm của nhiều thành phần trong xã hội"
      }
    ];
  }

  return {
    ...article,
    intro,
    content: [
      { type: "paragraph", text: paragraphs[0] },
      { type: "image", src: images[0].src, caption: images[0].caption },
      { type: "paragraph", text: paragraphs[1] },
      { type: "ad" }, // inline ad QC 650x300
      { type: "image", src: images[1].src, caption: images[1].caption },
      { type: "paragraph", text: paragraphs[2] }
    ]
  };
}

// Category Mock Data
export const categoryData: Record<
  string,
  CategoryFeed
> = {
  "tin-tuc": {
    label: "TIN TỨC",
    featured: {
      id: "hanoi-nang-nong-38-7",
      title: "Hà Nội ghi nhận mức nhiệt cao nhất cả nước: Trung tâm Thủ đô nóng ngột ngạt khó thở, người dân vật vã giữa \"chảo lửa\" 38,7 độ C",
      category: "Tin tức",
      time: "24/05/2026 15:18",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop",
      badge: "Tin tức"
    },
    list: [
      {
        id: "vietnam-thailand-tiem-nang",
        title: "Việt Nam và Thái Lan có tiềm năng trở thành trung tâm sản xuất lớn của thế giới",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "cong-an-tphcm-bat-ma-tuy",
        title: "Công an TPHCM bắt hơn 170 đối tượng ma túy, khống chế nhiều kẻ hung hãn",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "chung-cu-36-tang-nut-moi",
        title: "Chung cư 36 tầng ở TPHCM lại xuất hiện vết nứt mới",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "gia-xang-e10-giam-manh",
        title: "Giá xăng E10 giảm mạnh trước ngày bán đại trà, thấp hơn RON95 là 494 đồng/lít",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "du-bao-thoi-tiet-28-5",
        title: "Dự báo thời tiết 28/5/2026: Không khí mát tràn về, miền Bắc mưa giông giảm nhiệt",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "de-thi-toan-lop-10-hue-gia-mao",
        title: "Đề thi Toán lớp 10 ở Huế có 8 câu, tổng 11 điểm lan truyền trên mạng là giả mạo",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "treo-co-khong-lo-song-huong",
        title: "Treo cờ khổng lồ bên sông Hương đón mừng đại lễ Phật đản",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "quy-hoach-ven-song-hong-bat-dong-san",
        title: "Quy hoạch ven sông Hồng tái định hình bản đồ giá trị bất động sản Hà Nội",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "csgt-tphcm-dot-kich-lo-do-xe-dien",
        title: "CSGT TPHCM đột kích loạt lò 'độ' xe điện, tạm giữ hàng trăm phương tiện",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "sua-cau-phu-my-phan-luong-giao-thong",
        title: "Sửa cầu Phú Mỹ gần 1,5 tháng, CSGT TPHCM hướng dẫn phân luồng giao thông",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1519003722824-192514ad9360?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "chim-tau-11-ngu-dan-song-sot",
        title: "Chìm tàu, 11 ngư dân sống sót sau 12 giờ lênh đênh trên biển",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "sinh-vien-tot-nghiep-xuat-sac-quan-doi",
        title: "Sinh viên tốt nghiệp đại học xuất sắc vào quân đội có thể được phong thượng úy",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tin-tuc-extra-1",
        title: "Thủ tướng Chính phủ chủ trì Hội nghị phát triển vùng Đông Nam Bộ thúc đẩy liên kết kinh tế",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tin-tuc-extra-2",
        title: "Bộ Y tế khuyến cáo phòng chống bệnh mùa hè nắng nóng và các dịch bệnh truyền nhiễm",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tin-tuc-extra-3",
        title: "Tỷ giá USD tiếp tục biến động nhẹ, ngân hàng nhà nước duy trì chính sách ổn định vĩ mô",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tin-tuc-extra-4",
        title: "Hà Nội ra quân xử lý nghiêm các trường hợp vi phạm lấn chiếm lòng lề đường làm nơi kinh doanh",
        category: "Tin tức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1513829096999-4978602294fc?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  "anime-manga": {
    label: "ANIME/MANGA",
    featured: {
      id: "anime-featured",
      title: "One Piece 1116 chính thức ra mắt: Hé lộ sự thật chấn động về vũ khí cổ đại Uranus và số phận Vương quốc cổ đại",
      category: "Anime/Manga",
      time: "24/05/2026 15:18",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
      badge: "Anime/Manga"
    },
    list: [
      {
        id: "anime-list-1",
        title: "Kimetsu no Yaiba: Pháo Đài Vô Tận sẽ được chuyển thể thành trilogy movie chiếu rạp",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-2",
        title: "Tác giả Jujutsu Kaisen hé lộ cái kết gây tranh cãi của các nhân vật chính",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-3",
        title: "Solo Leveling mùa 2 công bố trailer chính thức và lịch phát sóng cuối năm 2026",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-4",
        title: "My Hero Academia bước vào chương cuối cùng: Cuộc đối đầu lịch sử giữa Deku và Shigaraki",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-5",
        title: "Top 10 bộ Manga có doanh thu cao nhất mọi thời đại: One Piece dẫn đầu danh sách",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-6",
        title: "Bleach: Huyết Chiến Ngàn Năm phần 3 tung visual mới cực ngầu của Ichigo Kurosaki",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-7",
        title: "Spy x Family Movie đạt doanh thu kỷ lục tại thị trường Việt Nam sau tuần đầu công chiếu",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-8",
        title: "Chainsaw Man phần phim Reze Arc tung teaser đầu tiên đầy ám ảnh",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-9",
        title: "Hunter x Hunter bất ngờ công bố chương mới sau thời gian dài tạm hoãn",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-10",
        title: "Các rạp phim Việt nhộn nhịp đón làn sóng fan anime trong mùa hè này",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-11",
        title: "Doraemon Movie 2026 chính thức hé lộ chủ đề phiêu lưu thời tiền sử cực kỳ hấp dẫn",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-list-12",
        title: "Fan hâm mộ trầm trồ trước bộ cosplay Frieren cực kỳ chất lượng tại lễ hội manga Hà Nội",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1531058020387-3be344559767?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-extra-1",
        title: "Genshin Impact công bố dự án anime chuyển thể dài tập hợp tác cùng studio Ufotable",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-extra-2",
        title: "Black Clover Movie đạt thứ hạng cao trên bảng xếp hạng thịnh hành toàn cầu của Netflix",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-extra-3",
        title: "Thương hiệu Yu-Gi-Oh! ra mắt bộ bài kỷ niệm 25 năm với những lá bài cực hiếm",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "anime-extra-4",
        title: "Triển lãm tranh vẽ gốc của tác giả Akira Toriyama thu hút hàng ngàn lượt khách tham quan",
        category: "Anime/Manga",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  "cong-nghe": {
    label: "CÔNG NGHỆ",
    featured: {
      id: "tech-featured",
      title: "NVIDIA GeForce RTX 5090 rò rỉ thông số khủng: Mạnh gấp đôi thế hệ trước, tiêu thụ điện năng kỷ lục",
      category: "Công nghệ",
      time: "24/05/2026 15:18",
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=600&auto=format&fit=crop",
      badge: "Công nghệ"
    },
    list: [
      {
        id: "tech-list-1",
        title: "Apple công bố chip M5 với nhân xử lý AI thế hệ mới vượt trội đối thủ",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-2",
        title: "ChatGPT-5 chính thức ra mắt toàn cầu: Đạt mức trí tuệ nhân tạo tổng hợp (AGI) sơ khai?",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-3",
        title: "Trên tay SSD PCIe Gen 6 đầu tiên thế giới với tốc độ đọc ghi lên tới 28 GB/s",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-4",
        title: "Các mẫu điện thoại gập năm 2026: Nếp gấp màn hình biến mất hoàn toàn",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-5",
        title: "Microsoft giới thiệu Windows 12 tích hợp sâu trợ lý ảo Copilot AI vào nhân hệ điều hành",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-6",
        title: "So sánh hiệu năng chip xử lý Snapdragon 8 Gen 5 và Apple A19 Pro",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-7",
        title: "Bàn phím cơ từ tính (HE) đang dần trở thành tiêu chuẩn mới cho các game thủ chuyên nghiệp",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-8",
        title: "Các mẫu tai nghe chống ồn chủ động (ANC) tốt nhất năm 2026",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-9",
        title: "Google ra mắt xe tự lái thế hệ mới không có vô lăng và bàn đạp tại California",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-10",
        title: "Cách tối ưu hóa hiệu năng máy tính chơi game chạy Windows 11 cực kỳ đơn giản",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-11",
        title: "Công nghệ màn hình OLED Micro-lens Array giúp tăng 50% độ sáng mà không tốn điện",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-list-12",
        title: "Người dùng Việt Nam đổ xô mua thiết bị nhà thông minh tương thích chuẩn Matter",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-extra-1",
        title: "Qualcomm công bố vi xử lý Snapdragon X Elite dành cho laptop Windows AI hiệu năng cực đỉnh",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-extra-2",
        title: "Sony giới thiệu máy ảnh Alpha 7R VI với cảm biến 100 megapixel tích hợp lấy nét AI tự động",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-extra-3",
        title: "Mạng di động 6G bắt đầu giai đoạn thử nghiệm tiêu chuẩn kỹ thuật đầu tiên tại Nhật Bản",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "tech-extra-4",
        title: "Hãng xe điện Tesla ra mắt phiên bản nâng cấp của Model Y với quãng đường di chuyển tăng 20%",
        category: "Công nghệ",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  "phim": {
    label: "PHIM",
    featured: {
      id: "movie-featured",
      title: "Avatar 3: Fire and Ash công bố trailer đầu tiên với bối cảnh bộ tộc tro tàn cực kỳ hoành tráng",
      category: "Phim",
      time: "24/05/2026 15:18",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
      badge: "Phim"
    },
    list: [
      {
        id: "movie-list-1",
        title: "Dune: Part Three chính thức khởi quay: Đạo diễn Denis Villeneuve hứa hẹn kết thúc hoành tráng",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-2",
        title: "Bom tấn Marvel tiếp theo đạt mốc doanh thu 1 tỷ USD chỉ sau 10 ngày ra rạp",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-3",
        title: "Phim điện ảnh Việt Nam đề tài lịch sử tạo nên cơn sốt phòng vé chưa từng có",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-4",
        title: "Batman: Part II tung trailer đen tối hơn, Joker lộ diện với tạo hình gây ám ảnh",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-5",
        title: "Top 10 phim truyền hình có điểm IMDb cao nhất nửa đầu năm 2026",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-6",
        title: "Đạo diễn Christopher Nolan công bố dự án phim giả tưởng tiếp theo hợp tác cùng Universal",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-7",
        title: "Netflix đầu tư khủng cho loạt phim truyền hình hành động chuyển thể từ game ăn khách",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-8",
        title: "Các rạp phim IMAX tại Việt Nam cháy vé liên tục trước sức hút của bom tấn viễn tưởng",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-9",
        title: "Loạt phim hoạt hình Disney kinh điển sẽ được làm lại dưới dạng live-action trong năm 2027",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-10",
        title: "LHP Cannes 2026: Phim độc lập châu Á thắng lớn với hàng loạt giải thưởng quan trọng",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1542204172-e7052809a86f?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-11",
        title: "Mads Mikkelsen xác nhận tham gia vai phản diện chính trong bom tấn hành động sắp tới",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-list-12",
        title: "Bộ phim trinh thám tâm lý của Hàn Quốc nhận bão lời khen từ giới chuyên môn Việt",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-extra-1",
        title: "Spider-Man: Beyond the Spider-Verse dời lịch chiếu sang mùa hè năm 2027 để hoàn thiện đồ họa",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-extra-2",
        title: "Gladiator II của đạo diễn Ridley Scott nhận phản hồi tích cực từ các nhà phê bình sớm",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-extra-3",
        title: "Phim truyền hình The Last of Us mùa 2 tung poster chính thức hứa hẹn cốt truyện đầy kịch tính",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "movie-extra-4",
        title: "Bí quyết đằng sau những cảnh kỹ xảo hành động mãn nhãn trong bom tấn Hollywood mới nhất",
        category: "Phim",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  "kien-thuc": {
    label: "KIẾN THỨC",
    featured: {
      id: "knowledge-featured",
      title: "Kính viễn vọng James Webb phát hiện hành tinh có bầu khí quyển chứa nước ở khoảng cách 100 năm ánh sáng",
      category: "Kiến thức",
      time: "24/05/2026 15:18",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
      badge: "Kiến thức"
    },
    list: [
      {
        id: "knowledge-list-1",
        title: "Tại sao bộ não con người lại thích những thông tin giật gân? Giải mã dưới góc độ khoa học thần kinh",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-2",
        title: "Khám phá rãnh Mariana: Nơi sâu nhất hành tinh ẩn chứa những sinh vật kỳ dị chưa từng biết",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-3",
        title: "Những phát minh vĩ đại thời cổ đại mà khoa học hiện đại vẫn chưa thể giải thích cách chế tạo",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-4",
        title: "Bí ẩn về sự sụp đổ của nền văn minh Maya dưới góc nhìn của các nhà khảo cổ học thế kỷ 21",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-5",
        title: "Hiện tượng Aurora (Cực quang): Bản giao hưởng ánh sáng kỳ diệu của tự nhiên giải thích thế nào?",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-6",
        title: "Vật lý lượng tử cho người mới bắt đầu: Hiểu về thế giới vi mô siêu việt cực kỳ đơn giản",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-7",
        title: "Lịch sử của đồng tiền: Từ vỏ sò, tiền vàng đến thời đại của tiền mã hóa và tiền kỹ thuật số",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-8",
        title: "Hiệu ứng cánh bướm (Butterfly Effect): Thay đổi nhỏ có thể định hình lại toàn bộ lịch sử nhân loại",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-9",
        title: "Trái Đất sẽ ra sao nếu loài ong hoàn toàn biến mất? Thảm họa sinh thái khó lường trước",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-10",
        title: "Bản đồ gen người được giải mã hoàn toàn: Kỷ nguyên y học cá nhân hóa đang đến rất gần",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-11",
        title: "Sự thật bất ngờ về loài cá voi xanh: Động vật lớn nhất lịch sử Trái Đất giao tiếp như thế nào?",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1518467166002-646897ef13a7?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-list-12",
        title: "Tại sao muối biển lại mặn còn nước sông suối lại ngọt? Chu kỳ nước giải thích chi tiết",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-extra-1",
        title: "Phát hiện loài khủng long mới có kích thước khổng lồ tại sa mạc Patagonia, Nam Mỹ",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-extra-2",
        title: "Tại sao một số người có khả năng ghi nhớ siêu việt còn người khác thì không? Khám phá y học",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-extra-3",
        title: "Dự án sinh học tổng hợp: Các nhà khoa học chế tạo thành công tế bào nhân tạo tự nhân đôi",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "knowledge-extra-4",
        title: "Nước biển dâng cao đe dọa sự sinh tồn của các đảo quốc nhỏ tại khu vực Thái Bình Dương",
        category: "Kiến thức",
        time: "24/05/2026 15:18",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
      }
    ]
  }
};

// Register in mockArticles list dynamically
if (typeof window === "undefined" || true) {
  Object.values(categoryData).forEach((cat) => {
    if (!mockArticles.some((a) => a.id === cat.featured.id)) {
      mockArticles.push(cat.featured);
    }
    cat.list.forEach((item) => {
      if (!mockArticles.some((a) => a.id === item.id)) {
        mockArticles.push(item);
      }
    });
  });
}
