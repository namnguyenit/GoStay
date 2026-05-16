package com.GoTravel.CartandOrder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CartandOrderApplication {

	public static void main(String[] args) {
		SpringApplication.run(CartandOrderApplication.class, args);
	}

}
