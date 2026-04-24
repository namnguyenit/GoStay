package com.Listing.CatalogandListing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên tỉnh thành (Ví dụ: Hà Nội, Đà Nẵng...)
    private String provinceName;

    // 1 Tỉnh thành có nhiều nhà hàng/cơ sở dịch vụ
    @OneToMany(mappedBy = "location")
    private List<Listing> listings;
}
