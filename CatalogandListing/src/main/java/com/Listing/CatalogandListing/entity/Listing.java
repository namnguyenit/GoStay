package com.Listing.CatalogandListing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên cơ sở/nhà hàng (VD: The Coffee House)
    private String name;

    // ID hoặc Username của chủ nhà hàng. Lấy từ token của bên Identity truyền sang
    private String ownerUsername;

    // 1 trường chứa tọa độ gộp trong entity (Embedded)
    @Embedded
    private Coordinate coordinate;

    // Thông tin tọa độ sẽ xử lý logic để móc nối thuộc vào tỉnh thành Location nào.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    // ** QUAN TRỌNG VỀ LOGIC PHÂN QUYỀN**:
    // 1 cơ sở chứa nhiều loại dịch vụ. 
    // Nếu là 'ROLE_HOST' -> Logic bên Service sẽ kiểm tra và CHỈ CHO PHÉP 1 service duy nhất.
    // Nếu là 'ROLE_ENTERPRISE' -> Logic bên Service sẽ cho MỞ KHÓA thêm List các service thoả mái.
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListingService> services;
}
