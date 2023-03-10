// natrium
// license : MIT
// author : Sean Chen

export enum ServerErrorCode {
    ResOK = 1,
    ResUnknown = 0,

    ResInternalError = -1,

    ResAlreadyLogin = -1001,
    ResCreatePlayerError = -1002,
    ResLoinedOtherUid = -1003,
    ResLoginTokenError = -1004,
}