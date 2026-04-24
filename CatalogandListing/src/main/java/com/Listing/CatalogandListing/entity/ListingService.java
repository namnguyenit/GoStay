package com.Listing.CatalogandListing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "listing_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên dịch vụ (VD: Thuê áo, Bán cà phê, Hồ bơi trẻ em, Ăn tự chọn...)
    private String serviceName;

    // Giá của dịch vụ
    private Double price;

    // FK kết nối trở về cái bảng Nhà hàng (Listing)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private Listing listing;
}
