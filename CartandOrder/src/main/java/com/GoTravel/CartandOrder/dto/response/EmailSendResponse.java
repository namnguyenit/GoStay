package com.GoTravel.CartandOrder.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class EmailSendResponse {
    private String messageId;
    private List<String> accepted;
    private List<String> rejected;
}
