import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsInt, Min, Max, MinLength, MaxLength, IsString, IsBoolean, IsOptional, IsUrl, IsObject, IsArray } from 'class-validator';

@Entity("messages")
export class MessagesEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    message_id?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    from_user?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    to_user?: number;  

    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    @Column()
    content?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    send_time?: number = Date.now();
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}