package com.Listing.CatalogandListing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
class CatalogandListingApplicationTests {
	private static final DockerImageName POSTGIS_IMAGE = DockerImageName
			.parse("postgis/postgis:16-3.4")
			.asCompatibleSubstituteFor("postgres");

	@Container
	static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(POSTGIS_IMAGE)
			.withDatabaseName("cataloglisting")
			.withUsername("postgres")
			.withPassword("postgres")
			.withInitScript("db/test/init-catalog-test-db.sql");

	@DynamicPropertySource
	static void configureDatasource(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
		registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
		registry.add("spring.flyway.enabled", () -> "true");
		registry.add("spring.flyway.baseline-on-migrate", () -> "false");
		registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
	}

	@Autowired
	JdbcTemplate jdbcTemplate;

	@Test
	void contextLoads() {
	}

	@Test
	void flywayCreatesPostgisCatalogSchema() {
		assertThat(exists("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis')"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.listings') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.landmarks') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.complexes') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.idx_listings_active_location_geog_gist') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.idx_landmarks_active_name_normalized_trgm') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT to_regclass('public.idx_listings_active_title_normalized_trgm') IS NOT NULL"))
				.isTrue();
		assertThat(exists("SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'catalog_readonly')"))
				.isTrue();
		assertThat(successfulFlywayMigrationCount()).isGreaterThanOrEqualTo(9);
	}

	@Test
	void normalizedSearchColumnsAreAvailableForNode() {
		assertThat(exists("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'landmarks' AND column_name = 'name_normalized')"))
				.isTrue();
		assertThat(exists("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'listings' AND column_name = 'title_normalized')"))
				.isTrue();
		assertThat(jdbcTemplate.queryForObject("SELECT public.gostay_normalize_search_text('Thác   Bản Giốc')", String.class))
				.isEqualTo("thac ban gioc");
	}

	@Test
	void flywayCreatesCoordinateRangeConstraints() {
		assertThat(constraintExists("listings", "chk_listings_latitude_range")).isTrue();
		assertThat(constraintExists("listings", "chk_listings_longitude_range")).isTrue();
		assertThat(constraintExists("landmarks", "chk_landmarks_latitude_range")).isTrue();
		assertThat(constraintExists("landmarks", "chk_landmarks_longitude_range")).isTrue();
		assertThat(constraintExists("complexes", "chk_complexes_latitude_range")).isTrue();
		assertThat(constraintExists("complexes", "chk_complexes_longitude_range")).isTrue();
		assertThat(constraintExists("landmark_suggestions", "chk_landmark_suggestions_latitude_range")).isTrue();
		assertThat(constraintExists("landmark_suggestions", "chk_landmark_suggestions_longitude_range")).isTrue();
	}

	private Boolean exists(String sql) {
		return jdbcTemplate.queryForObject(sql, Boolean.class);
	}

	private Integer successfulFlywayMigrationCount() {
		return jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM public.flyway_schema_history WHERE success = true",
				Integer.class
		);
	}

	private Boolean constraintExists(String tableName, String constraintName) {
		return jdbcTemplate.queryForObject(
				"""
				SELECT EXISTS (
				    SELECT 1
				    FROM pg_constraint c
				    JOIN pg_class t ON t.oid = c.conrelid
				    JOIN pg_namespace n ON n.oid = t.relnamespace
				    WHERE n.nspname = 'public'
				      AND t.relname = ?
				      AND c.conname = ?
				)
				""",
				Boolean.class,
				tableName,
				constraintName
		);
	}
}
