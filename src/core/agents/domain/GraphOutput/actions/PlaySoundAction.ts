import { ACTION_TYPE, IPlaySoundAction } from "../types";
import BaseAction from "./BaseAction";

class PlaySoundAction extends BaseAction  implements IPlaySoundAction {
    readonly _type = ACTION_TYPE.PLAY_SOUND_ACTION;
    audioFilename: string;

    constructor(audioFilename: string) {
        super();
        this.audioFilename = audioFilename;
    }

    getAudioFilename(): string {
        return this.audioFilename;
    }

    toJSON(): object {
        return {
            _type: this._type,
            audioFilename: this.audioFilename,
        };
    }
 }
export default PlaySoundAction;