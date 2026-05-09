package com.Listing.CatalogandListing.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ReviewSubmittedEvent extends ApplicationEvent {
    private final UUID listingId;

    public ReviewSubmittedEvent(Object source, UUID listingId) {
        super(source);
        this.listingId = listingId;
    }
}
