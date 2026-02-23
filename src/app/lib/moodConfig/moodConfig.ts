import cryingGirl from "figma:asset/d09d72fc7694f2cb7388e3cf50e72d90bbb2580b.png";
import sadGirl from "figma:asset/77d90566fcfc94be04f71554db563c066a1a507a.png";
import neutralGirl from "figma:asset/ac49256d859dda169e83a80385a32180b53d8da3.png";
import happyGirl from "figma:asset/40073ee12c50533ea0698888974913cc5a156504.png";
import excitedGirl from "figma:asset/629cdb8dac199461e6a36b8d0ea4c4e3bac7323d.png";

import cryingBoy from "figma:asset/1a287432af8853ec350b5de82794b6d30d35ae57.png";
import sadBoy from "figma:asset/aa9aae3e8e12f4bdaa61ff1073fbf96fb0142fe3.png";
import neutralBoy from "figma:asset/5b5bb1e28b3f887644168bc087a4cc62b975aa59.png";
import happyBoy from "figma:asset/e1a3e2965aef6eb6ebbc0071e1546450f2636070.png";
import excitedBoy from "figma:asset/0cbb9164204411aa7c9d4cde96a33b42e7e2e43b.png";

export type Gender = 'boy' | 'girl';

export const MOOD_EMOJIS = [
    { 
        range: [1, 2], 
        emoji: "😣", 
        color: "bg-red-400", 
        label: "Terrible", 
        illustration: {
            girl: cryingGirl,
            boy: cryingBoy
        }
    },
    { 
        range: [3, 4], 
        emoji: "😔", 
        color: "bg-orange-400", 
        label: "Bad", 
        illustration: {
            girl: sadGirl,
            boy: sadBoy
        }
    },
    { 
        range: [5, 6], 
        emoji: "😐", 
        color: "bg-gray-400", 
        label: "Okay", 
        illustration: {
            girl: neutralGirl,
            boy: neutralBoy
        }
    },
    { 
        range: [7, 8], 
        emoji: "🙂", 
        color: "bg-lime-400", 
        label: "Good", 
        illustration: {
            girl: happyGirl,
            boy: happyBoy
        }
    },
    { 
        range: [9, 10], 
        emoji: "🤩", 
        color: "bg-green-400", 
        label: "Amazing", 
        illustration: {
            girl: excitedGirl,
            boy: excitedBoy
        }
    },
];

export type MoodConfig = typeof MOOD_EMOJIS[number];

export const getMoodConfig = (value: number): MoodConfig => {
    return MOOD_EMOJIS.find(m => value >= m.range[0] && value <= m.range[1]) || MOOD_EMOJIS[2];
};
