import { useEffect, useState } from "react";
import { ClickAwayListener } from "@mui/material";

export default function CustomTimePicker(props: {
    onChange: Function
}) {
    const [hour, setHour] = useState<string | undefined>();
    const [minute, setMinute] = useState<string | undefined>();
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (hour && minute) {
            props.onChange(`${hour}:${minute}`);
            if (hour && !minute) {
                setMinute("00")
            }
        }
        if (hour && !minute) {
            setMinute("00")
        }
        // eslint-disable-next-line
    }, [hour, minute]);
    return (
        <div>
            <ClickAwayListener onClickAway={() => setOpen(false)} >
                <div className="CustomTimePicker">
                    <div className="time-show" onClick={() => setOpen(!open)}>
                        {hour ?
                            <>
                                {hour} : {minute}
                            </>
                            :
                            <>
                                Raffle End Time
                            </>
                        }

                    </div>
                    <div className="time-picker" style={{ display: open ? "flex" : "none" }}>
                        <div className="time-side">
                            {hours.map((item, key) => (
                                <button key={key} onClick={() => setHour(item)}>{item}</button>
                            ))}
                        </div>
                        <div className="time-side">
                            {mins.map((item, key) => (
                                <button key={key} onClick={() => setMinute(item)}>{item}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </ClickAwayListener>
        </div>
    )
}
const hours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
const mins = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "52", "53", "54", "55", "56", "57", "58", "59",]
