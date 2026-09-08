# Skill: Clean Architecture + DDD Module Architecture

## 1. Mục tiêu

Khi xây dựng bất kỳ module nào trong ứng dụng, phải tuân thủ kiến trúc **Clean Architecture kết hợp Domain-Driven Design (DDD)**.

Mỗi module được tổ chức độc lập theo cấu trúc:

```text
module/
├── presentation/
│   └── controller/
│
├── application/
│   ├── port/
│   └── usecase/
│
├── domain/
│   ├── entity/
│   └── repository/
│
└── infrastructure/
    ├── repository/
    └── mapper/
```

Tên thư mục có thể được điều chỉnh theo convention của project, nhưng phải giữ nguyên trách nhiệm của từng layer.

---

# 2. Nguyên tắc Dependency

Nguyên tắc quan trọng nhất:

> Layer chỉ được phụ thuộc vào abstraction mà nó cần, không phụ thuộc trực tiếp vào implementation của layer bên ngoài.

Dependency direction:

```text
Presentation ──────┐
                   ↓
               Application
                   ↓
                Domain
                   ↑
                   │
Infrastructure ────┘
```

Hoặc hiểu theo dependency:

```text
Presentation → Application → Domain
Infrastructure → Domain
```

Trong đó:

- `Domain` không phụ thuộc vào bất kỳ layer nào.
- `Application` chỉ phụ thuộc vào `Domain`.
- `Presentation` có thể phụ thuộc vào `Application` và `Domain` khi cần.
- `Infrastructure` có thể phụ thuộc vào `Domain` và các framework/external technology.
- `Application` **không được biết** `Presentation`.
- `Application` **không được biết** `Infrastructure`.
- `Domain` **không được biết** `Application`, `Presentation`, `Infrastructure`.
- Không được import implementation của layer khác nếu có thể phụ thuộc vào abstraction.

---

# 3. Domain Layer

Domain là trung tâm của module và chứa business logic cốt lõi.

Cấu trúc:

```text
domain/
├── entity/
└── repository/
```

## 3.1 Entity

`entity/` chứa các Domain Entity.

Entity:

- Đại diện cho khái niệm nghiệp vụ.
- Có identity.
- Chứa business rules thuộc về chính entity.
- Không phụ thuộc framework.
- Không phụ thuộc database.
- Không phụ thuộc ORM.
- Không phụ thuộc HTTP.
- Không phụ thuộc controller.
- Không phụ thuộc use case.

Ví dụ:

```text
domain/entity/User.ts
domain/entity/Conversation.ts
```

Không được viết:

```ts
import { PrismaClient } from "@prisma/client";
```

trong Domain Entity.

---

## 3.2 Repository Definition

`repository/` chỉ chứa **abstraction/interface** của repository.

Domain định nghĩa repository vì Domain/Application cần khả năng truy xuất hoặc lưu Domain Entity nhưng không cần biết dữ liệu được lưu bằng cách nào.

Ví dụ:

```ts
export interface UserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}
```

Domain chỉ biết:

> "Tôi cần một UserRepository có các operation này."

Domain không biết:

- PostgreSQL
- Prisma
- MongoDB
- Redis
- HTTP API
- filesystem
- ORM

---

# 4. Application Layer

Application chứa application business logic và orchestration của use case.

Cấu trúc:

```text
application/
├── port/
└── usecase/
```

Application chỉ được phụ thuộc vào Domain.

Application **không được import trực tiếp**:

```text
presentation/
infrastructure/
```

---

# 5. Application Port

`application/port/` chứa các **interface/abstraction của Use Case**.

Port đại diện cho contract mà bên ngoài có thể sử dụng để thực hiện một application use case.

Ví dụ:

```ts
export interface CreateUserUseCase {
    execute(input: CreateUserInput): Promise<CreateUserOutput>;
}
```

Port chỉ định nghĩa contract:

```text
Input
↓
Use Case Contract
↓
Output
```

Không chứa implementation cụ thể.

---

# 6. Application Use Case

`application/usecase/` chứa implementation của các use case được định nghĩa trong `application/port`.

Ví dụ:

```text
application/
├── port/
│   └── CreateUserUseCase.ts
│
└── usecase/
    └── CreateUserUseCaseImpl.ts
```

Implementation có thể inject các repository abstraction từ Domain.

Ví dụ:

```ts
class CreateUserUseCaseImpl implements CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
    ) {}

    async execute(input: CreateUserInput) {
        // application logic

        const user = User.create(input);

        await this.userRepository.save(user);

        return user;
    }
}
```

Điểm quan trọng:

```text
UseCase
   ↓
UserRepository interface
```

Không được:

```text
UseCase
   ↓
PrismaUserRepository
```

Application không được biết repository được implement bằng Prisma hay công nghệ nào khác.

---

# 7. Infrastructure Layer

Infrastructure chứa implementation cụ thể của các abstraction được định nghĩa ở phía trong.

Ví dụ:

```text
infrastructure/
├── repository/
│   └── PrismaUserRepository.ts
│
└── mapper/
    └── UserMapper.ts
```

Infrastructure có trách nhiệm:

- Database access.
- ORM.
- External API.
- File system.
- Cache.
- Message broker.
- Framework-specific implementation.
- Implement repository interface.

Ví dụ:

```ts
class PrismaUserRepository implements UserRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) {}

    async findById(id: string): Promise<User | null> {
        const model = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!model) {
            return null;
        }

        return UserMapper.toDomain(model);
    }

    async save(user: User): Promise<void> {
        const model = UserMapper.toPersistence(user);

        await this.prisma.user.create({
            data: model,
        });
    }
}
```

Infrastructure phụ thuộc vào abstraction:

```text
PrismaUserRepository
        ↓ implements
UserRepository
```

Không đảo ngược interface để Domain biết Prisma.

---

# 8. Presentation Layer

Presentation chịu trách nhiệm giao tiếp với bên ngoài.

Ví dụ:

```text
presentation/
└── controller/
    └── UserController.ts
```

Controller:

- Nhận HTTP request.
- Validate/parse input ở boundary phù hợp.
- Gọi Application Use Case.
- Chuyển application output thành response.
- Không chứa business logic.
- Không truy cập database trực tiếp.
- Không inject Infrastructure Repository trực tiếp nếu không cần thiết.

Ví dụ:

```ts
class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
    ) {}

    async create(request: Request) {
        const input = CreateUserMapper.toInput(request);

        const result = await this.createUserUseCase.execute(input);

        return UserResponseMapper.toResponse(result);
    }
}
```

Dependency:

```text
Controller
    ↓
CreateUserUseCase interface
```

Không:

```text
Controller
    ↓
PrismaUserRepository
```

---

# 9. Mapper

Mapper được sử dụng khi hai layer không nên biết trực tiếp representation của nhau.

Mapper có thể được đặt ở layer phù hợp, ví dụ:

```text
presentation/mapper/
infrastructure/mapper/
application/mapper/
```

Tùy loại dữ liệu cần chuyển đổi.

Ví dụ:

```text
HTTP Request DTO
       ↓
Presentation Mapper
       ↓
Application Input
```

và:

```text
Database Model
       ↓
Infrastructure Mapper
       ↓
Domain Entity
```

và:

```text
Domain/Application Output
       ↓
Presentation Mapper
       ↓
HTTP Response DTO
```

Không truyền trực tiếp Database Model vào Domain nếu hai representation khác nhau.

Ví dụ:

```text
Prisma User
     ↓
UserMapper
     ↓
Domain User
```

---

# 10. Dependency Inversion

Một nguyên tắc bắt buộc:

> Nếu A cần khả năng của B nhưng A không nên biết implementation của B, hãy định nghĩa abstraction/interface ở phía mà A được phép biết và inject implementation vào từ bên ngoài.

Ví dụ Application cần Repository:

```text
Application
    ↓
UserRepository interface
```

Infrastructure implement:

```text
PrismaUserRepository
        ↓
implements UserRepository
```

Composition Root sẽ kết nối chúng:

```text
UserRepository
      ↑
PrismaUserRepository

CreateUserUseCase
      ↑
UserController
```

Có thể hình dung:

```text
                 ┌─────────────────────┐
                 │   Presentation      │
                 │                     │
                 │   Controller        │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │   Application       │
                 │                     │
                 │   UseCase Port      │
                 │        ↑            │
                 │   UseCase Impl      │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │      Domain         │
                 │                     │
                 │ Entity              │
                 │ Repository Contract │
                 └──────────┬──────────┘
                            ↑
                            │ implements
                 ┌─────────────────────┐
                 │   Infrastructure    │
                 │                     │
                 │ Repository Impl     │
                 │ Mapper              │
                 └─────────────────────┘
```

---

# 11. Quy tắc "A không cần biết B"

Áp dụng quy tắc:

> Nếu A không cần biết B, A không được import B.

Thay vào đó:

```text
A
↓
Interface / Port
↑
B
```

Ví dụ:

### Sai

```text
Application
    ↓
PrismaUserRepository
```

Application biết Infrastructure.

### Đúng

```text
Application
    ↓
UserRepository
    ↑
PrismaUserRepository
```

Application chỉ biết abstraction.

---

# 12. Quy tắc Dependency Injection

Dependency phải được inject từ bên ngoài thay vì tự khởi tạo implementation bên trong.

Không làm:

```ts
class CreateUserUseCase {
    private repository = new PrismaUserRepository();
}
```

Làm:

```ts
class CreateUserUseCase {
    constructor(
        private readonly repository: UserRepository,
    ) {}
}
```

Việc wiring dependency được thực hiện ở Composition Root / Module configuration.

Ví dụ:

```text
Composition Root
│
├── PrismaUserRepository
│          ↓
│   UserRepository
│
├── CreateUserUseCaseImpl
│          ↓
│   CreateUserUseCase
│
└── UserController
           ↓
    CreateUserUseCase
```

---

# 13. Quy tắc không được vi phạm

AI khi tạo code phải kiểm tra các quy tắc sau:

### Domain

- Không import Application.
- Không import Presentation.
- Không import Infrastructure.
- Không import ORM.
- Không import database implementation.
- Không import framework-specific code.

### Application

- Không import Presentation.
- Không import Infrastructure.
- Chỉ sử dụng Domain và các abstraction của Application.
- Repository phải được inject thông qua interface.

### Infrastructure

- Có thể import Domain abstraction để implement.
- Có thể sử dụng ORM/framework/database.
- Có trách nhiệm chuyển đổi Persistence Model ↔ Domain Model.

### Presentation

- Có thể sử dụng Application Port.
- Không truy cập repository/database trực tiếp.
- Không chứa business logic thuộc Domain/Application.
- Dùng mapper nếu representation khác nhau.

---

# 14. Quy tắc ưu tiên Dependency

Khi có nhiều cách triển khai, ưu tiên dependency theo thứ tự:

```text
Abstraction > Concrete Implementation
Domain > Infrastructure
Use Case > Repository Implementation
Port > Adapter
Dependency Injection > Direct Instantiation
Mapper > Leaking External Model
```

---

# 15. Quy tắc tạo một module mới

Khi tạo module mới, thực hiện theo thứ tự:

### Step 1 — Xác định Domain

Tạo:

```text
domain/entity/
domain/repository/
```

Xác định:

- Entity.
- Value Object nếu cần.
- Domain rules.
- Repository contracts.

### Step 2 — Xác định Use Case

Tạo:

```text
application/port/
application/usecase/
```

Mỗi use case nên có:

```text
UseCase Port
      ↓
UseCase Implementation
```

### Step 3 — Implement Infrastructure

Tạo:

```text
infrastructure/repository/
infrastructure/mapper/
```

Implement repository contract bằng database/ORM/external service.

### Step 4 — Implement Presentation

Tạo:

```text
presentation/controller/
presentation/mapper/
```

Controller chỉ gọi Application Port.

### Step 5 — Wire Dependencies

Tại Composition Root:

```text
Infrastructure implementation
        ↓
Domain repository interface
        ↓
Application use case
        ↓
Application port
        ↓
Presentation controller
```

---

# 16. Ví dụ cấu trúc hoàn chỉnh

```text
user/
├── presentation/
│   ├── controller/
│   │   └── UserController.ts
│   └── mapper/
│       └── UserResponseMapper.ts
│
├── application/
│   ├── port/
│   │   ├── CreateUserUseCase.ts
│   │   └── GetUserUseCase.ts
│   │
│   └── usecase/
│       ├── CreateUserUseCaseImpl.ts
│       └── GetUserUseCaseImpl.ts
│
├── domain/
│   ├── entity/
│   │   └── User.ts
│   │
│   └── repository/
│       └── UserRepository.ts
│
└── infrastructure/
    ├── repository/
    │   └── PrismaUserRepository.ts
    │
    └── mapper/
        └── UserMapper.ts
```

Dependency:

```text
UserController
      │
      │ depends on
      ↓
CreateUserUseCase
      │
      │ implemented by
      ↓
CreateUserUseCaseImpl
      │
      │ depends on
      ↓
UserRepository
      ↑
      │ implements
      │
PrismaUserRepository
```

---

# 17. Core Philosophy

Kiến trúc phải đảm bảo:

```text
Domain không biết gì
        ↓
Application biết Domain
        ↓
Presentation biết Application
Infrastructure biết Domain
```

Nhưng **implementation dependency không được làm Domain/Application bị phụ thuộc vào Infrastructure**.

Mục tiêu cuối cùng:

> Business rules nằm ở Domain/Application, còn framework, database, HTTP và các external technology nằm ở phía ngoài và có thể thay thế mà không làm thay đổi business core.

Khi AI viết code cho module, luôn kiểm tra:

1. Dependency có đi đúng hướng không?
2. Có layer nào biết implementation mà không cần biết không?
3. Có thể thay concrete dependency bằng interface không?
4. Domain có bị phụ thuộc framework/database không?
5. Application có import Infrastructure/Presentation không?
6. Repository implementation có implement đúng contract của Domain không?
7. Có cần Mapper để ngăn external model leaking vào Domain không?
8. Dependency có được inject từ Composition Root không?