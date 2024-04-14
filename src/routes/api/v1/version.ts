import { Get, JsonController } from "routing-controllers";
import { readVersion } from "@src/version";

@JsonController('/api/v1/version')
export class VersionController {
    @Get()
    async getVersion() {
        return readVersion();
    }
}