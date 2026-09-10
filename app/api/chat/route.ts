import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  KIRA_TOOL_DEFINITIONS,
  executeCatalogOrShowroomsQuery,
  executeCreateDraftOrder,
  parseWidthFromString,
  parseThicknessFromString,
  DraftOrderResult,
  HCM_HOTLINE_DISPLAY
} from "@/lib/ai-assistant-tools";
import { SITE_CONFIG } from "@/config/site-config";

const SYSTEM_PROMPT = `
Bạn là Chuyên Viên Tư Vấn Giấc Ngủ & Kỹ Thuật Đệm cao cấp của ${SITE_CONFIG.brand.name} (${SITE_CONFIG.brand.domain}).
Bạn đại diện cho xưởng sản xuất nệm công nghệ cao với triết lý: ${SITE_CONFIG.brand.slogan}, tối ưu nhiệt ẩm khí hậu nhiệt đới Việt Nam.

PHONG CÁCH & QUY TẮC PHỤC VỤ (QUIET LUXURY - ZERO AI SLOP):
1. Xưng hô: "${SITE_CONFIG.brand.name}" hoặc "Em" - gọi khách hàng là "Quý khách" hoặc "Anh/Chị". Giọng văn lịch thiệp, am hiểu kỹ thuật, điềm tĩnh, trung thực, không dùng lời tâng bốc sáo rỗng.
2. DỮ LIỆU ĐỘC QUYỀN & CHÍNH XÁC:
   - Khi khách hỏi thông số nệm, độ dày, độ cứng, chất liệu hoặc tìm showroom: BẮT BUỘC dùng tool query_catalog_or_showrooms để lấy dữ liệu thực tế từ hệ thống, KHÔNG tự bịa giá hay địa chỉ showroom.
   - Khi khách hỏi giá của kích thước cụ thể (1m0, 1m2, 1m4, 1m6, 1m8 x 2m và độ dày 10cm, 15cm, 20cm): dùng tool query_catalog_or_showrooms với queryType="price_lookup".
3. QUY TRÌNH CHỐNG ĐƠN ẢO & XÁC THỰC ZALO 1-CHẠM (BẮT BUỘC):
   - Khi khách hàng muốn đặt hàng nệm:
     Bạn PHẢI hướng dẫn và yêu cầu khách cung cấp ĐẦY ĐỦ 5 thông tin:
     + Họ tên người nhận
     + Số điện thoại (chính xác 10 số bắt đầu bằng 0)
     + Địa chỉ email (để xưởng gửi biên lai và phiếu bảo hành điện tử ${SITE_CONFIG.policies.minWarrantyYears}-${SITE_CONFIG.policies.maxWarrantyYears} năm)
     + Địa chỉ nhận hàng cụ thể (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)
     + Kích thước và độ dày nệm mong muốn.
   - TUYỆT ĐỐI KHÔNG ĐƯỢC gọi tool create_draft_order nếu chưa có đủ cả email và số điện thoại. Hãy lịch sự nhắc khách cung cấp nốt thông tin còn thiếu.
   - Khi đã có đủ thông tin, hãy gọi tool create_draft_order.
   - Sau khi tạo đơn dự thảo, giải thích rõ: Thẻ xác thực đơn hàng dự thảo đã sẵn sàng ngay bên dưới. Quý khách chỉ cần bấm vào nút "Xác Nhận Qua Zalo (1-Chạm)" để gửi tin nhắn kích hoạt đơn và xác thực số điện thoại chính chủ qua xưởng.
4. CÁC DÒNG NỆM TRỌNG TÂM:
   - Cao Su Non America: Lõi Foam High-Resilience ép định hình dẻo dai, giá kinh tế nhất, phù hợp sinh viên, nhà trọ, căn hộ cho thuê.
   - Thăng Long Classic: Nệm cao su nhân tạo tỷ trọng cao, vải gấm chần vi tính kháng khuẩn, cân bằng êm ái cho mọi lứa tuổi gia đình.
   - Nệm Than Hoạt Tính: Khử mùi ẩm mốc, lọc khuẩn, vi bọt khí làm mát, rất tốt cho người lớn tuổi và trẻ nhỏ hay đổ mồ hôi trộm.
   - Nệm Memory Foam: Công nghệ ôm trọn đường cong sinh học cơ thể, giải tỏa áp lực điểm tì đè, lý tưởng cho người thoát vị đĩa đệm, đau thắt lưng.
   - Nệm Cao Su Thiên Nhiên (3/4 & 100%): Mủ cao su thiên nhiên chuẩn xuất khẩu, đàn hồi dẻo dai bậc nhất, bền bỉ trên 15 năm.
   - Nệm Dự Án Vinhalatex Khách Sạn: Tiêu chuẩn 5 sao resort, sang trọng và nâng đỡ chuẩn y khoa.
5. CHÍNH SÁCH VÀNG:
   - Nằm thử ${SITE_CONFIG.policies.sleepTrialNights} đêm tại nhà, đổi trả nếu không phù hợp cảm giác nằm.
   - Bảo hành chính hãng ${SITE_CONFIG.policies.minWarrantyYears} - ${SITE_CONFIG.policies.maxWarrantyYears} năm tại xưởng sản xuất.
   - ${SITE_CONFIG.policies.freeDeliveryText}, hỗ trợ khiêng lên tầng và đặt nệm lên giường.
   - Hotline hỗ trợ: ${SITE_CONFIG.contact.hotlineDisplay}.
`;

interface ChatRequestPayload {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

/**
 * Intelligent deterministic fallback when Kira AI key is absent or unreachable
 */
async function handleFallback(lastUserMessage: string): Promise<{
  message: string;
  orderCard: DraftOrderResult | null;
}> {
  const text = lastUserMessage.toLowerCase();

  // 1. Showroom search intent
  if (
    text.includes("showroom") ||
    text.includes("địa chỉ") ||
    text.includes("cửa hàng") ||
    text.includes("ở đâu") ||
    text.includes("chi nhánh")
  ) {
    let province = "";
    if (text.includes("đồng nai") || text.includes("biên hòa")) province = "Đồng Nai";
    else if (text.includes("tây ninh")) province = "Tây Ninh";
    else if (text.includes("bình phước")) province = "Bình Phước";
    else if (text.includes("long an")) province = "Long An";

    const data = await executeCatalogOrShowroomsQuery({
      queryType: "showroom_locator",
      province: province || undefined
    });

    const showroomList = (data.showrooms || [])
      .slice(0, 4)
      .map(
        (s) =>
          `• **${s.name}**: ${s.address}\n  *(Giờ mở cửa: ${s.hours} | [Chỉ đường Google Maps](${s.directionsUrl}))*`
      )
      .join("\n\n");

    return {
      message: `Dạ, hệ thống xưởng ${SITE_CONFIG.brand.name} có 7 showroom chính hãng phục vụ quý khách nằm thử thực tế:\n\n${showroomList}\n\nQuý khách được **trải nghiệm ${SITE_CONFIG.policies.sleepTrialNights} đêm nằm thử tại nhà** và xưởng hỗ trợ **${SITE_CONFIG.policies.freeDeliveryText.toLowerCase()}**! Hotline xưởng: **${SITE_CONFIG.contact.hotlineDisplay}**.`,
      orderCard: null
    };
  }

  // 2. Draft order creation intent
  const phoneMatch = text.match(/(0\d{9})/);
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  const wantsOrder =
    text.includes("đặt") ||
    text.includes("mua") ||
    text.includes("chốt") ||
    text.includes("order") ||
    phoneMatch !== null;

  if (wantsOrder) {
    if (!phoneMatch || !emailMatch) {
      return {
        message: `Dạ để hoàn tất hồ sơ tạo đơn hàng dự thảo và kích hoạt chính sách **Bảo hành chính hãng ${SITE_CONFIG.policies.minWarrantyYears}-${SITE_CONFIG.policies.maxWarrantyYears} năm**, xưởng cần xác nhận đầy đủ:\n\n1. **Họ tên** người nhận\n2. **Số điện thoại** (10 số bắt đầu bằng 0)\n3. **Địa chỉ email** (để nhận hóa đơn & phiếu bảo hành điện tử)\n4. **Địa chỉ nhận hàng** chi tiết\n5. **Kích thước & độ dày** nệm mong muốn.\n\nQuý khách vui lòng gửi kèm cả **Số điện thoại** và **Email** để em xuất thẻ xác thực Zalo 1-Chạm ngay cho quý khách nhé ạ!`,
        orderCard: null
      };
    }

    // Has both phone & email -> extract or default details
    const phone = phoneMatch[1];
    const email = emailMatch[1];

    let productSlug = "classic";
    let productName = "Nệm Cao Su Thăng Long Classic";
    if (text.includes("america")) {
      productSlug = "america";
      productName = "Nệm Cao Su Non America";
    } else if (text.includes("hoạt tính") || text.includes("than")) {
      productSlug = "hoat-tinh";
      productName = "Nệm Than Hoạt Tính Kháng Khuẩn";
    } else if (text.includes("memory") || text.includes("foam")) {
      productSlug = "memory-foam";
      productName = "Nệm Memory Foam Trợ Cột Sống";
    } else if (text.includes("thiên nhiên")) {
      productSlug = "cao-su-thien-nhien";
      productName = "Nệm Cao Su Thiên Nhiên 100%";
    }

    const width = parseWidthFromString(text);
    const thickness = parseThicknessFromString(text);

    try {
      const orderCard = await executeCreateDraftOrder({
        customerName: "Quý Khách Hàng",
        phoneNumber: phone,
        customerEmail: email,
        shippingAddress: "Khu vực giao tận phòng miễn phí (Xác thực qua Zalo)",
        productSlug,
        productName,
        dimension: `${width}x200cm`,
        thickness: `${thickness}cm`,
        quantity: 1,
        notes: "Khách đặt nhanh qua trợ lý AI xưởng nệm"
      });

      return {
        message: `Dạ tuyệt vời ạ! Đơn hàng dự thảo **#${orderCard.orderCode}** của Quý khách đã được thiết lập thành công trên hệ thống.\n\nĐể chống các đơn hàng đặt nhầm và giữ chính sách **Miễn phí giao hàng tận giường**, Quý khách vui lòng bấm nút **"Xác Nhận Qua Zalo (1-Chạm)"** ở thẻ đơn hàng bên dưới để kích hoạt đơn ngay ạ!`,
        orderCard
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Vui lòng kiểm tra lại thông tin";
      return {
        message: `Dạ em gặp một chút trục trặc khi tạo đơn: ${msg}. Quý khách có thể nhắn trực tiếp hotline xưởng **${SITE_CONFIG.contact.hotlineDisplay}** để em hỗ trợ chốt đơn ngay ạ!`,
        orderCard: null
      };
    }
  }

  // 3. Price or spec lookup intent
  if (
    text.includes("giá") ||
    text.includes("nhiêu") ||
    text.includes("kích thước") ||
    text.includes("1m") ||
    text.includes("độ dày")
  ) {
    let slug = "classic";
    if (text.includes("america")) slug = "america";
    else if (text.includes("hoạt tính") || text.includes("than")) slug = "hoat-tinh";
    else if (text.includes("memory") || text.includes("foam")) slug = "memory-foam";
    else if (text.includes("thiên nhiên")) slug = "cao-su-thien-nhien";
    else if (text.includes("khách sạn")) slug = "khach-san";

    const width = parseWidthFromString(text);
    const thickness = parseThicknessFromString(text);

    const priceData = await executeCatalogOrShowroomsQuery({
      queryType: "price_lookup",
      productSlug: slug,
      dimension: `${width}x200cm`,
      thickness: `${thickness}cm`
    });

    const specData = await executeCatalogOrShowroomsQuery({
      queryType: "product_specs",
      productSlug: slug
    });

    return {
      message: `Dạ em xin gửi bảng giá và thông số chuẩn xưởng dòng **${slug.toUpperCase()}**:\n\n• **Quy cách:** Rộng ${priceData.width}cm x Dài 200cm x Dày ${priceData.thickness}cm\n• **Giá niêm yết xưởng:** **${priceData.formattedPrice}**\n• **Chất liệu lõi:** ${specData.coreMaterial || "Cao su tỷ trọng cao đàn hồi đa vùng"}\n• **Cảm giác nằm:** ${specData.firmnessIndex || "6.5/10 - Êm ái nâng đỡ sinh học"}\n• **Bảo hành:** ${specData.warrantyYears || SITE_CONFIG.policies.minWarrantyYears} năm tại xưởng\n\nQuý khách được **${SITE_CONFIG.policies.freeDeliveryText.toLowerCase()}** và trải nghiệm **${SITE_CONFIG.policies.sleepTrialNights} đêm nằm thử**. Quý khách có muốn em lập đơn dự thảo giữ mức giá này không ạ?`,
      orderCard: null
    };
  }

  // 4. Default welcoming consultation
  return {
    message: `Kính chào Quý khách! Em là chuyên viên tư vấn giấc ngủ tại **Xưởng ${SITE_CONFIG.brand.name}**.\n\nEm có thể hỗ trợ Quý khách:\n1. 🛏️ **Chọn nệm theo thể trạng:** Đau mỏi thắt lưng, thoát vị đĩa đệm, hay người thích nằm êm mát.\n2. 💰 **Tra cứu giá chính xác:** Theo kích thước 1m0 - 1m8 và độ dày 10cm - 20cm.\n3. 📍 **Tìm 7 showroom gần nhất:** Đồng Nai, Tây Ninh, Bình Phước, Long An.\n4. 📦 **Lập đơn dự thảo & Xác thực 1-chạm qua Zalo** phòng tránh đơn ảo.\n\nQuý khách đang quan tâm đến dòng nệm nào ạ?`,
    orderCard: null
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestPayload;
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Danh sách tin nhắn không được để trống." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.content || "";

    const apiKey = process.env.KIRA_AI_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.KIRA_AI_BASE_URL || "https://api.kiraai.vn/v1";
    const model = process.env.KIRA_AI_MODEL || "kira-3.5-turbo";

    // If API key is not configured or in testing environment, invoke high-precision fallback
    if (!apiKey || apiKey.includes("your-") || apiKey === "demo-key") {
      const fallback = await handleFallback(userText);
      return NextResponse.json(fallback);
    }

    // Initialize OpenAI client pointing to Kira AI endpoint
    const openai = new OpenAI({
      apiKey,
      baseURL
    });

    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))
    ];

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: conversationHistory,
        tools: KIRA_TOOL_DEFINITIONS as unknown as OpenAI.Chat.Completions.ChatCompletionTool[],
        tool_choice: "auto",
        temperature: 0.3
      });

      const choice = completion.choices[0];
      const toolCalls = choice?.message?.tool_calls;

      let draftOrderResult: DraftOrderResult | null = null;

      if (toolCalls && toolCalls.length > 0) {
        // Execute tool calls
        const toolResponses: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];

        for (const call of toolCalls) {
          if (call.type === "function") {
            const funcName = call.function.name;
            let funcArgs: Record<string, unknown> = {};
            try {
              funcArgs = JSON.parse(call.function.arguments);
            } catch {
              funcArgs = {};
            }

            let resultOutput: unknown = null;

            if (funcName === "query_catalog_or_showrooms") {
              resultOutput = await executeCatalogOrShowroomsQuery(
                funcArgs as Parameters<typeof executeCatalogOrShowroomsQuery>[0]
              );
            } else if (funcName === "create_draft_order") {
              try {
                const orderResult = await executeCreateDraftOrder(
                  funcArgs as unknown as Parameters<typeof executeCreateDraftOrder>[0]
                );
                draftOrderResult = orderResult;
                resultOutput = orderResult;
              } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : "Lỗi tạo đơn";
                resultOutput = { error: errorMsg };
              }
            }

            toolResponses.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(resultOutput)
            });
          }
        }

        // Secondary call to synthesize natural language response
        const secondaryCompletion = await openai.chat.completions.create({
          model,
          messages: [
            ...conversationHistory,
            choice.message,
            ...toolResponses
          ],
          temperature: 0.3
        });

        const finalMessage =
          secondaryCompletion.choices[0]?.message?.content ||
          choice.message?.content ||
          "Dạ em đã tra cứu thông tin cho quý khách ạ!";

        return NextResponse.json({
          message: finalMessage,
          orderCard: draftOrderResult
        });
      }

      return NextResponse.json({
        message: choice?.message?.content || "Dạ Nệm Thăng Long có thể hỗ trợ gì thêm cho Quý khách ạ?",
        orderCard: null
      });
    } catch (apiError) {
      console.warn("[KiraAI/OpenAI] Remote API invocation error, falling back to local engine:", apiError);
      const fallback = await handleFallback(userText);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("[POST /api/chat] Handler error:", error);
    return NextResponse.json(
      { error: `Không thể xử lý tin nhắn lúc này. Vui lòng thử lại sau hoặc gọi hotline ${SITE_CONFIG.contact.hotlineDisplay}.` },
      { status: 500 }
    );
  }
}
