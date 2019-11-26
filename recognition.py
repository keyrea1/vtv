mode = "changed"  # || 'off' || 'work'
wagon_numbers = []
wagon_photos = dict()
wagon_numbers_to_save = []
wagon_photos_to_save = dict()
cameras = []


def set_mode(data):
    global mode

    mode = data


def get_mode():
    global mode

    return mode


def clear_data():
    global wagon_numbers
    global wagon_photos

    wagon_numbers = []
    wagon_photos = []


def set_status(_cameras):
    from sqlDriver import get_cameras
    global cameras
    bd_cameras = get_cameras()['params']
    _mode = "work"

    if _cameras == 0:
        cameras = []
    else:
        cameras = _cameras

    if mode == 'changed':
        _mode = mode
        set_mode('work')
    if len(bd_cameras) == 0:
        _mode = 'off'
        set_mode(_mode)

    return {"mode": _mode}


def get_status():
    global cameras

    return cameras


def get_data(count):
    global wagon_numbers
    global wagon_photos
    global wagon_numbers_to_save
    global wagon_photos_to_save

    data = {}
    if count == 1:
        data['wagon_number'] = wagon_numbers[-1]
        data['photo_path'] = wagon_photos[data['wagon_number']][0]
        wagon_numbers_to_save.append(data['wagon_number'])
        wagon_photos_to_save[data['wagon_number']] = wagon_photos[data['wagon_number']]
    else:
        i = 1
        numbers_array = []
        photos_array = []
        while i < count:
            _wagon_number = wagon_numbers.pop()
            numbers_array.append(_wagon_number)
            photos_array.append(wagon_photos[_wagon_number][0])
            del wagon_photos[_wagon_number]
        data['wagon_number'] = numbers_array
        data['photo_path'] = photos_array

    wagon_numbers = []
    wagon_photos = []

    return {"wagon_number": data}


def set_data(data):
    global wagon_numbers
    global wagon_photos
    global wagon_numbers_to_save
    global wagon_photos_to_save
    answer = dict()
    answer['method'] = "setPhoto"

    try:
        _wagon_number = list(data.keys())[0]
        if len(wagon_numbers) > 0:
            # clearing cache
            if len(wagon_numbers) > 100:
                wagon_numbers = []
                wagon_photos = {}
            if _wagon_number != wagon_numbers[-1]:
                wagon_numbers.append(_wagon_number)
                wagon_photos[_wagon_number] = data[_wagon_number]
        else:
            wagon_numbers.append(_wagon_number)
            wagon_photos[_wagon_number] = data[_wagon_number]

        answer["answer"] = "ok"
        if len(wagon_numbers_to_save) > 0:
            answer['params'] = wagon_photos_to_save
            wagon_photos_to_save = {}
            wagon_numbers_to_save = []

    except Exception as inst:
        from sqlDriver import set_system_log
        sys_data = {"method": 'setPhoto', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer = {"answer": "error", "message": inst}

    return answer
