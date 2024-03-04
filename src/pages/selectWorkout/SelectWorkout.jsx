import React, { useEffect, useState } from "react";
import style from "./SelectWorkout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkout } from "../../store/coursesSlice";
import { Link, useParams } from "react-router-dom";
import made from "./made.png";

export const SelectWorkout = () => {
  const params = useParams();
  const [currentWorkoutsArr, setCurrentWorkoutsArr] = useState([]);
  const currentUser = useSelector((state) => state.userApp.fullCurrentUser);

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser);
      const arr = Object.values(currentUser.courses).find(
        (course) => course.name === params.id
      ).workouts;
      setCurrentWorkoutsArr(Object.values(arr));
    }
  }, [currentUser, params.id]);

  const dispatch = useDispatch();

  const handleClick = (el) => {
    dispatch(setCurrentWorkout(el._id));
  };

  return (
    <div className={style.selectWorkout}>
      <div className={style.selectWorkout_box}>
        <h1 className={style.selectWorkout_title}>Выберите тренировку</h1>
        <div className={style.workouts}>
          {currentWorkoutsArr?.map((el) => {
            return (
              <Link
              to={`/${params.id}/training/${el._id}`}
                className={style[`workout_${el.done}`]}
                key={el.name}
                onClick={() => {
                  handleClick(el);
                }}
              >
                <p className={style[`workoutText_${el.done}`]}>{el.name}</p>
                {el.done && <img className={style.workoutMade_img} src={made} alt="made" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
