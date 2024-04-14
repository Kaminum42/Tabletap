import { IsInt, IsObject, IsOptional, Max, Min } from "class-validator";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity({ name: 'rankings' })
export class RankingsEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    ranking_id?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    game_id?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    user_id?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    count?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    max_score?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    total_score?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    update_time?: number = Date.now();

    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}