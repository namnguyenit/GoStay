package com.gotravel.Identity.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

// BƯỚC 1: TẠO FILE CẤU HÌNH ĐỌC KEYSTORE (Mở Két Sắt)
// Class này làm nhiệm vụ đọc file keystore.jks trong thư mục resources, 
// sau đó bóc tách cái Private Key (chỉ ghi/ký) và Public Key (chỉ đọc/verify) ra lưu trên RAM.
@Configuration
public class RsaKeyConfig {

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;

    // Các thông số này sẽ cấu hình trong file application-dev.yaml
    public RsaKeyConfig(
            @Value("${jwt.keystore.path}") String keyStorePath,
            @Value("${jwt.keystore.password}") String keyStorePassword,
            @Value("${jwt.keystore.alias}") String keyAlias,
            @Value("${jwt.keystore.private-key-password}") String privateKeyPassword) {
        try {
            // Bước 1.1: Mở két sắt (KeyStore)
            KeyStore keyStore = KeyStore.getInstance("JKS");
            InputStream is = getClass().getResourceAsStream(keyStorePath);
            keyStore.load(is, keyStorePassword.toCharArray());

            // Bước 1.2: Lấy Private Key ra (Cái này cực kỳ nguy hiểm, chỉ nội bộ server Identity có nhiệm vụ KÝ JWT)
            this.privateKey = (RSAPrivateKey) keyStore.getKey(keyAlias, privateKeyPassword.toCharArray());

            // Bước 1.3: Lấy Public Key (Khóa này ai cũng được lấy (kể cả FE), dùng để dòm xem token có phải chuẩn anh Identity cấp ko)
            this.publicKey = (RSAPublicKey) keyStore.getCertificate(keyAlias).getPublicKey();

        } catch (Exception e) {
            throw new RuntimeException("Không thể tải Keystore để khởi tạo khóa, hệ thống từ chối khởi động!", e);
        }
    }

    public RSAPrivateKey getPrivateKey() {
        return privateKey;
    }

    public RSAPublicKey getPublicKey() {
        return publicKey;
    }
}
