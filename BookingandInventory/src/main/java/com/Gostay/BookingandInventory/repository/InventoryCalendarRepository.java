package com.Gostay.BookingandInventory.repository;

import com.Gostay.BookingandInventory.entity.InventoryCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryCalendarRepository extends JpaRepository<InventoryCalendar, UUID> {
    List<InventoryCalendar> findByListingIdAndDateBetween(UUID listingId, LocalDate startDate, LocalDate endDate);
    
    Optional<InventoryCalendar> findByListingIdAndDateAndTimeSlot(UUID listingId, LocalDate date, String timeSlot);
    
    List<InventoryCalendar> findByListingIdAndDateBetweenAndTimeSlot(UUID listingId, LocalDate startDate, LocalDate endDate, String timeSlot);
    
    List<InventoryCalendar> findByListingIdAndDate(UUID listingId, LocalDate date);
}
