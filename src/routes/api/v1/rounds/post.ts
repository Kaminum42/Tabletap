import { AppDataSource } from "@src/data_source";
import { RankingsEntity } from "@src/entities/rankings";
import { RoundsEntity } from "@src/entities/rounds";
import { pickProperties } from "@src/utils/pick_properties";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError, Body, ForbiddenError, JsonController, Post, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/rounds')
export class RoundsPostController {
    @Post()
    async postRound(@Session() sess: any, @Body() body: any, @Res() res: any) {

        const roundRepo = AppDataSource.getRepository(RoundsEntity);
        const rankingRepo = AppDataSource.getRepository(RankingsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const props = ['associated_game', 'players', 'scores', 'details'];

        const round = plainToInstance(RoundsEntity, pickProperties(body, props));

        round.round_id = 0;
        round.create_time = Date.now();

        const errors = await validate(round);
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        if(sess.user.permission_level >= 300 && !round.players?.includes(sess.user.user_id)) {
            throw new ForbiddenError('You do not have permission to create such a round.');
        }

        // FIXME is it ok to use save()?
        await roundRepo.save(round);

        // update rankings
        for(const player of round.players ?? []) {
            const ranking = await rankingRepo.findOne({ 
                where: { 
                    user_id: player, 
                    game_id: round.associated_game 
                } 
            });

            const idx = round.players?.indexOf(player) ?? -1;
            const score = (round.scores ?? [])[idx];

            // count, max_score, total_score, update_time
            if(ranking) {
                ranking.count = (ranking.count ?? 0) + 1;
                ranking.max_score = Math.max(ranking.max_score ?? 0, score);
                ranking.total_score = (ranking.total_score ?? 0) + score;
                ranking.update_time = Date.now();
                await rankingRepo.save(ranking);
            } else {
                const newRanking = new RankingsEntity();
                newRanking.user_id = player;
                newRanking.game_id = round.associated_game;
                newRanking.count = 1;
                newRanking.max_score = score;
                newRanking.total_score = score;
                newRanking.update_time = Date.now();
                await rankingRepo.save(newRanking);
            }
        }

        res.statusCode = 200;
        return {};
    }
}