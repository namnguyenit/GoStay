package com.Gostay.BookingandInventory.service;

import com.Gostay.BookingandInventory.dto.request.ForceBlockRequest;
import com.Gostay.BookingandInventory.dto.response.SyncResponse;
import com.Gostay.BookingandInventory.entity.InventoryCalendar;
import com.Gostay.BookingandInventory.enums.InventoryCalendarStatus;
import com.Gostay.BookingandInventory.repository.InventoryCalendarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * -----------------------------------------------------------------------------
 * LỚP NGHIỆP VỤ ADMIN (System Operation & Maintenance)
 * -----------------------------------------------------------------------------
 * Nhiệm vụ:
 * - Thực thi các lệnh Cưỡng chế và Đồng bộ hệ thống cấp bách.
 * - Logic Sync (Đồng bộ) sau này có thể mở rộng để quét toàn bộ Database,
 *   đếm lại các Lock đã hết hạn, đối soát giữa availableQuantity và Lock,
 *   từ đó tự động khắc phục các lỗi sai sót kho (nếu có).
 * -----------------------------------------------------------------------------
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryAdminService {

    private final InventoryCalendarRepository calendarRepository;

    @Transactional
    public void forceBlock(UUID listingId, ForceBlockRequest request) {
        log.info("Admin force blocking listing {}", listingId);
        List<InventoryCalendar> calendars = calendarRepository.findByListingIdAndDateBetween(listingId, request.getStartDate(), request.getEndDate());
        for (InventoryCalendar calendar : calendars) {
            calendar.setStatus("BLOCKED".equalsIgnoreCase(request.getStatus()) ? InventoryCalendarStatus.BLOCKED : InventoryCalendarStatus.AVAILABLE);
            calendarRepository.save(calendar);
        }
    }

    @Transactional
    public SyncResponse syncInventory(UUID listingId) {
        log.info("Admin syncing inventory for listing {}", listingId);
        // Basic sync logic placeholder (In real world, you'd recalculate based on config and active locks)
        return SyncResponse.builder().recordsFixed(0).build();
    }
}
