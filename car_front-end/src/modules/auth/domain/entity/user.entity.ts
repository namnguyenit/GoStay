export interface UserProps {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  role: string;
}

export class UserEntity {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get username(): string | undefined {
    return this.props.username;
  }
  get email(): string {
    return this.props.email;
  }
  get fullName(): string {
    return this.props.fullName;
  }
  get role(): string {
    return this.props.role;
  }

  public getDisplayName(): string {
    return (
      this.props.fullName ||
      this.props.username ||
      this.props.email ||
      "Tài khoản"
    );
  }

  public isAdmin(): boolean {
    return this.props.role === "ADMIN";
  }

  public isOperator(): boolean {
    return this.props.role === "OPERATOR" || this.props.role === "ADMIN";
  }
}
