export interface ContentBlock {
  type: "paragraph" | "bold-paragraph" | "image" | "ad";
  text?: string;
  src?: string;
  caption?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  badge?: string;
  intro?: string;
  content?: ContentBlock[];
}

export const mockArticles: Article[] = [
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
