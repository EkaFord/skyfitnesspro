import React, { useState, useEffect } from 'react';
import { Button } from '../../UI/Button/Button';
import styles from './Progress.module.scss';
import { useSelector } from 'react-redux';
import { hidePopupFlag } from '../../components/hidePopup/hidePopupFlag';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, child, push, update } from 'firebase/database';

export const Progress = () => {
  const navigate = useNavigate();
  const currentId = localStorage.getItem('userId'); // id пользователя
  const currentCourse = localStorage.getItem('currentCourse'); //Название текущего курса
  const currentW = localStorage.getItem('currentWorkout'); //ID текущей тренировки

  const usersCourses = useSelector((state) => state.coursesApp.usersCourses); //Шаблоны курсов
  //Находим список упражнений
  const currentUserCourse = usersCourses ? usersCourses.filter((el) => el.name === currentCourse) : null;
  const exercisesList = currentUserCourse
    ? Object.values(currentUserCourse[0].workouts).filter((el) => el._id === currentW)
    : null;
  const emptyExercises = exercisesList ? exercisesList[0].exercises : null;
  const [userProgress, setuserProgress] = useState(emptyExercises); // прогресс пользователя, сначала тот, что приходит с базы, пустой

  //Помещаем в прогресс пустые значения
  useEffect(() => {
    if (userProgress === null) {
      setuserProgress(emptyExercises);
    }
  }, [userProgress, emptyExercises]);

  //Обрабатываем ввод пользователя
  const handleInputChange = (e, elKey) => {
    console.log(elKey);
    console.log(exercisesList[0]);
    const newuserProgress = userProgress.map((ex) => {
      if (ex.name === elKey.name) {
        if (Number(e.target.value) > ex.quantity) {
          alert('Вы ввели слишком большое число');
          let a = { ...ex };
          a.made = Number(e.target.value);
          console.log(a);
          return a;
        } else {
          let a = { ...ex };
          a.made = Number(e.target.value);
          console.log(a);
          return a;
        }
      } else {
        console.log(ex);
        return ex;
      }
    });
    console.log(newuserProgress);
    setuserProgress(newuserProgress);
  };

  //Меняем флаги, если количество сделаных повторений равно или больше нужного
  const progressCheck = (userProgress) => {
    let fieldValidation = true; //Флаг на проверку превышения количества повторений
    const numberOfRepetitionsDone = userProgress.map((el) => {
      if (el.made > el.quantity) {
        alert('Вы ввели слишком большое число');
        fieldValidation = false;
      }
      if (el.made === el.quantity) {
        el.done = true;
        return el;
      } else {
        console.log(el);
        return el;
      }
    });
    if (fieldValidation) {
      //Проверяем, не превышено какое либо количество повторений
      sendProgress(numberOfRepetitionsDone);
      allTrainingCompleted(numberOfRepetitionsDone);
    }
  };

  //Отправляем новый прогресс в базу
  const sendProgress = (numberOfRepetitionsDone) => {
    console.log(numberOfRepetitionsDone);
    const db = getDatabase();
    const updates = {};
    updates[`users/${currentId}/courses/${currentCourse}/workouts/${currentW}/exercises`] = numberOfRepetitionsDone;
    return update(ref(db), updates);
  };

  //Проверка на выполнение всех упражнений в тренировке
  const allTrainingCompleted = (numberOfRepetitionsDone) => {
    let everythingIsDone = true;
    for (let exercis of numberOfRepetitionsDone) {
      if (exercis.done === false) {
        everythingIsDone = false;
      }
    }
    if (everythingIsDone) {
      console.log(numberOfRepetitionsDone);
      const db = getDatabase();
      const updates = {};
      updates[`users/${currentId}/courses/${currentCourse}/workouts/${currentW}/done`] = true;
      return update(ref(db), updates);
    }
  };

  const hidePopup = (e, type) => {
    if (hidePopupFlag(e, type)) navigate(-1);
  };

  const onFocusFirstInput = () => {
    const firstInputEl = document.getElementsByTagName('input');
    firstInputEl[0]?.focus();
  };
  useEffect(() => onFocusFirstInput(), []);

  return (
    <>
      {exercisesList && (
        <div
          className={styles.popup_wrapper}
          onMouseUp={(e) => hidePopup(e, 'mouse')}
          onKeyDown={(e) => hidePopup(e, 'kbd')}
        >
          <div className={styles.progressForm} id='#popup'>
            <div className={styles.headerForm}>Мой прогресс</div>
            {exercisesList[0].exercises.map((el, index) => {
              return (
                <div key={index}>
                  <div className={styles.textForm}>
                    Сколько раз вы сделали: <br />"{el.name}"?
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.inputForm}
                      type='number'
                      name='quantity'
                      placeholder='Введите значение'
                      onChange={(e) => handleInputChange(e, el)}
                      max={el.quantity}
                    ></input>
                  </div>
                </div>
              );
            })}
            <div className={styles.buttonBox}>
              <Button
                className={'button_blue'}
                children={'Отправить'}
                onClick={() => {
                  progressCheck(userProgress);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
