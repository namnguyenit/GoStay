package com.Listing.CatalogandListing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CatalogandListingApplication {

	public static void main(String[] args) {
		SpringApplication.run(CatalogandListingApplication.class, args);
	}

}
