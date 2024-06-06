import moment from "moment";
import React, { useEffect, useState } from "react";
import DatePicker from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

const disabledDays = [
    {
        year: 2022,
        month: 6,
        day: 20,
    },
    {
        year: 2019,
        month: 3,
        day: 25,
    },
    {
        year: 2019,
        month: 3,
        day: 6,
    }
];

export default function CustomDatePicker(props: {
    onChange: Function
}) {
    const [selectedDay, setSelectedDay] = useState<DateType>();
    const [disableDays, setDisableDays] = useState<DateType[]>();
    const handleDate = (e: any) => {
        setSelectedDay({
            day: e.day,
            month: e.month,
            year: e.year
        })
        props.onChange(`${e.year}/${e.month}/${e.day}`);
    }
    const getDisableData = () => {
        const day = moment().format("DD");
        const year = moment().format("YYYY");
        const lastMonth = moment().subtract(1, 'months').format("M");
        const month = moment().format("M");
        let disable: DateType[] = [];

        for (let m = 0; m < parseInt(lastMonth); m++) {
            for (let d = 0; d < 31; d++) {
                disable.push({
                    year: parseInt(year),
                    month: m + 1,
                    day: d + 1
                })
            }
        }
        for (let i = 0; i < parseInt(day); i++) {
            disable.push({
                year: parseInt(year),
                month: parseInt(month),
                day: i + 1
            })
        }
        setDisableDays(disable)
    }
    useEffect(() => {
        getDisableData();
    }, [])

    return (
        <DatePicker
            value={selectedDay}
            disabledDays={disableDays}
            onChange={handleDate}
            inputPlaceholder="Raffle End Date"
        />
    );
};

interface DateType {
    day: number
    month: number
    year: number
}
