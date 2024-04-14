import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsInt, IsString, IsBoolean, IsObject, IsOptional, IsPhoneNumber, IsUrl, MaxLength, MinLength, Matches, Max, Min, IsDefined } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('users')
export class UsersEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    user_id?: number;

    @IsString()
    @MinLength(1)
    @MaxLength(32)
    @Matches(/^[a-zA-Z0-9_-]+$/)
    @Column({ length: 32, unique: true })
    username?: string;

    @IsString()
    @Matches(/^\$2[abxy]{1}\$[1-9]{1}[0-9]{1}\$[A-Za-z0-9./]{53}$/)
    @Column({ length: 60 })
    password?: string;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    permission_level?: number;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(32)
    @Column({ length: 32, nullable: true })
    nickname?: string;

    @IsOptional()
    @MaxLength(255)
    @IsEmail()
    @Column({ length: 255, unique: true, nullable: true })
    email?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(18446744073709551615)
    @Column({ type: 'bigint', nullable: true })
    create_time?: number = Date.now();

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(18446744073709551615)
    @Column({ type: 'bigint', nullable: true })
    update_time?: number = Date.now();

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column({ nullable: true })
    experience?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column({ nullable: true })
    level?: number;

    @IsOptional()
    @MaxLength(2048)
    @IsUrl()
    @Column({ length: 2048, nullable: true })
    icon_url?: string;

    @IsOptional()
    @MaxLength(32)
    @Column({ length: 32, nullable: true })
    gender?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(18446744073709551615)
    @Column({ type: 'bigint', nullable: true })
    birthday?: number;

    @IsOptional()
    @MaxLength(32)
    @IsPhoneNumber('CN')
    @Column({ length: 32, nullable: true })
    phone?: string;

    @IsOptional()
    @MaxLength(255)
    @Column({ length: 255, nullable: true })
    address?: string;

    @IsBoolean()
    @Column({ nullable: true })
    profile_visibility?: boolean;

    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}
