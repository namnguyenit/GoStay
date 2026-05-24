package com.Gostay.BookingandInventory.mapper;

import com.Gostay.BookingandInventory.dto.response.CalendarResponse;
import com.Gostay.BookingandInventory.dto.response.LockResponse;
import com.Gostay.BookingandInventory.entity.InventoryCalendar;
import com.Gostay.BookingandInventory.entity.InventoryLock;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T16:06:01+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class InventoryMapperImpl implements InventoryMapper {

    @Override
    public CalendarResponse toCalendarResponse(InventoryCalendar calendar) {
        if ( calendar == null ) {
            return null;
        }

        CalendarResponse.CalendarResponseBuilder calendarResponse = CalendarResponse.builder();

        calendarResponse.status( enumToString( calendar.getStatus() ) );
        calendarResponse.date( calendar.getDate() );
        calendarResponse.timeSlot( calendar.getTimeSlot() );
        if ( calendar.getAvailableQuantity() != null ) {
            calendarResponse.availableQuantity( calendar.getAvailableQuantity() );
        }

        return calendarResponse.build();
    }

    @Override
    public LockResponse toLockResponse(InventoryLock lock) {
        if ( lock == null ) {
            return null;
        }

        LockResponse.LockResponseBuilder lockResponse = LockResponse.builder();

        lockResponse.lockId( lock.getId() );
        lockResponse.lockStatus( enumToString( lock.getLockStatus() ) );
        lockResponse.orderId( lock.getOrderId() );
        if ( lock.getLockedQuantity() != null ) {
            lockResponse.lockedQuantity( lock.getLockedQuantity() );
        }

        return lockResponse.build();
    }
}
