import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterModule } from "./help-water"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { ThiefCropModule } from "./thief-crop"
import { ThiefAnimalProductModule } from "./thief-animal-product"
import { UnfollowModule } from "./unfollow"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        HelpCureAnimalModule,
        HelpWaterModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        ThiefCropModule,
        ThiefAnimalProductModule
    ]
})
export class CommunityModule {}
