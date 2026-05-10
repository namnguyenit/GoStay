package com.Listing.CatalogandListing.dto.request.review;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ReplyReviewRequest {
    @NotBlank(message = "Reply comment cannot be empty")
    private String replyComment;
}
