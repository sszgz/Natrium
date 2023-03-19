// natrium
// license : MIT
// author : Sean Chen

export enum ServerErrorCode {
    ResOK = 1,
    ResUnknown = 0,

    ResInternalError = -1,
    ResDatacompCreateError = -2,
    ResMsgParamError = -3,

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
}