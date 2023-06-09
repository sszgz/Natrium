// natrium
// license : MIT
// author : Sean Chen

export enum ServerErrorCode {
    ResOK = 1,
    ResUnknown = 0,

    ResInternalError = -1,
    ResDatacompCreateError = -2,
    ResMsgParamError = -3,
    ResNotGM = -4,

    ResAlreadyLogin = -1001,
    ResCreatePlayerError = -1002,
    ResLoinedOtherUid = -1003,
    ResLoginTokenError = -1004,
    ResServiceWrong = -1005,
    ResCreatePlayerAlreadyExist = -1006,
    ResUserLoginedByOther = -1007,
    ResUserNotExist = -1008,
    ResSessionNotLogin = -1009,
    ResServiceSessionNotExist = -1010,
    ResServicePlayerNotExist = -1011,
    ResPlayerDataNotExist = -1012,
    ResPlayerNotinMap = -1013,
    ResPlayerToMapNotExist = -1014,
    ResPlayerToSameMap = -1015,
    ResPlayerMapNoBornPos = -1016,
    ResPlayerFirstInitError = -1017,
    ResPlayerToMapPointNotExist = -1018,
    ResPlayerInSameMap = -1019,
    ResPlayerToMapPointTooFar = -1020,
    ResTargetPlayerNotExist = -1021,

    ResPort_PortNotExist = -2001,
    ResPort_MapMineNotExist = -2002,
    ResPort_MapMineTooFar = -2003,
    ResPort_ManulMineNotStart = -2004,
    ResPort_MapMinePlyaerFull = -2005,
    ResPort_PlayerNotInThisManulMine = -2006,
    ResPort_AlreadyInManulMine = -2007,
    ResPort_ManulMineNothingToFetch = -2008,
    ResPort_PlayerNoPortWarrant = -2009,
    ResPort_FactoryConfError = -2010,
    ResPort_FactoryLineIndexError = -2011,
    ResPort_FactoryLineOutputNotEmpty = -2012,
    ResPort_FactoryLineNotFinishWorking = -2013,
    ResPort_FactoryItemConfNotExist = -2014,
    ResPort_FactoryLevelRequire = -2015,
    ResPort_FactoryNotEnoughInputItem = -2016,
    ResPort_FactoryInputItemConfError = -2017,
    ResPort_FactoryHeroAlreadySet = -2018,
    ResPort_FactoryHeroNotSet = -2019,
    ResPort_FactoryNothingToFetch = -2020,
    ResPort_AddStoreHouseItemFailed = -2021,
    ResPort_PlayerActpointNotEnough = -2022,
    ResPort_HeroActpointNotEnough = -2023,
    ResPort_ManulMineCDing = -2024,
    ResPort_PlayerAlreadyInMine = -2025,
    ResPort_MineOutputItemError = -2026,

    ResPlayer_PetNotExist = -2101,
    ResPlayer_HeroNotExist = -2102,
    ResPlayer_HeroNotBindToMine = -2103,
    ResPlayer_HeroAlreadyInMine = -2104,
    ResPlayer_HeroNotInMine = -2105,
    ResPlayer_NotInThisMine = -2106,
    ResPlayer_HeroAlreadyInFactory = -2107,
    ResPlayer_HeroNotInFactory = -2107,
}