import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateOperatorApplicationDto {
  @IsNotEmpty({ message: 'Tên nhà xe không được để trống.' })
  @IsString({ message: 'Tên nhà xe phải là chuỗi ký tự.' })
  @Length(3, 100, { message: 'Tên nhà xe phải có độ dài từ 3 đến 100 ký tự.' })
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại liên hệ không được để trống.' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại liên hệ không đúng định dạng số điện thoại Việt Nam 10 chữ số.',
  })
  phone: string;

  @IsNotEmpty({ message: 'Địa chỉ trụ sở không được để trống.' })
  @IsString({ message: 'Địa chỉ trụ sở phải là chuỗi ký tự.' })
  address: string;
}
