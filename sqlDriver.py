# -*- coding: utf-8 -*-
"""
    vtv-shell.sqlDriver module
    ~~~~~~~~~~~~~~~~~~~~~~~~
    This module contains PonyORM and PostgreSQL functions.
    v.0.0.2
    :copyright: (c) 2018 ZVO
"""
import datetime
import os
import hashlib
from pony.orm import *
from psycopg2 import connect
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import db_user, db_password, db_host, db_port, db_name
import weight_math
db = Database()

from models import *

set_sql_debug(True)

def create_tables():
    INV = [False] * 8
    ADCCH = [0, 1, 3, 2, 4, 5, 7, 6]
    OFFSET = [0] * 8
    CAL_TABLE = [[[0 for f in range(3)] for g in range(10)] for h in range(8)]
    points = {"1": [0] * 10, "2": [0] * 10}
    save_adc_settings(INV, ADCCH, OFFSET)
    save_cal_tables(CAL_TABLE)
    save_cal_points(points)
    data = {'TYPVES': "блаблавесы", 'NPV': 150, 'DISCR': 10, 'NOMSI': "hzvashpeche", 'PREC': "OIML R76-1-2011-III",
            'PONAME': "VTV", 'POID': "vesyblya", 'POVER': "stinga s date", 'POMD5': "63705d4beb6e355f4e44d1a0da472d41",
            'ORGANIZ': "vasya",
            'NOMVES': 1, 'TELWAG': True, 'CTMAXX': 400, 'CTMAXY': 200,
            'WMAX': 100, 'WTHR': 0, 'PERIOD': 0, 'TABLUSE': 0, 'GOST': 0,
            'LASTPOV': datetime.now().strftime('%Y-%m-%d %H:%M'), 'GOSPOV': "asdasd", 'PREDPRED': "asdsa", 'PREDZVO': "asdasd",
            'COMPTT': "0", 'SPEEDT': '9600', 'DYN': True, 'KKORR': '1', 'W_THRES': 40,
            'Z_LEVEL': 20, 'CALMTIME': 6, 'L_PLAT': 4110, 'COMPT': "COM7",
            'SPEED': 115200, 'BRW': 1520, 'BRH': 4110, 'BRB': 8904, 'PROGSTAT': 4,
            'CURRSOST': 1, 'CURRWAG': 0, 'DISCR1': 10, 'DISCR_THRES': 1000, "right_platform": True}
    save_strange_table(data)

    global_data = {"static_wagon": True, "dynamic": True, "recognition": True, "dosing": True, "rfid": True,
                   "one_c": True, "blockinTime": datetime.strptime('2019-06-13', '%Y-%m-%d').date()}
    set_globals(global_data)

    user_data = {"id": 3, 'user_name': "superuser", 'credentials': "Администратор", 'password': "rfrjqnjhfyljvysqgfhjkm",
                 'phonenumber': "",
                 'backup': True, 'explore_weight_arch': True, 'explore_logs': True, 'printing': True,
                 'adding_arch_data': True, 'cancel_weighting': True, 'change_arch_data': True,
                 'add_user': True,
                 'change_wagon_number': True, 'locale': "ru", 'theme': "light", 'verification': True,
                 'configuration': True, 'save_archive': True, 'save_events': True,
                 'table_configuration': True,
                 'tara_control': True, 'calibration': True, 'update_speed': 5}
    set_settings(user_data)

    from config import keys

    for i in keys:
        set_keys(i)
# PostgreSQL


try:
    db.bind(provider='postgres', user=db_user, password=db_password, host=db_host, port=db_port, database=db_name)

    db.generate_mapping(create_tables=True)
except Exception as inst:
    print("idling..")


def checkdb():
    con = connect(dbname='postgres', user=db_user, host=db_host, password=db_password, port=db_port)
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = con.cursor()
    cur.execute("SELECT datname FROM pg_database")
    sql_data = cur.fetchall()
    if db_name not in (str(sql_data)):
        cur.execute('CREATE DATABASE ' + db_name)
        db.bind(provider='postgres', user=db_user, password=db_password, host=db_host, port=db_port, database=db_name)

        db.generate_mapping(create_tables=True)
        create_tables()
    con.close()
    log_data = {"source": 'system', "name": 'Programm was started', "user": "2"}
    set_log(log_data)


@db_session
def set_keys(data):

    Keys(**data)

@db_session
def addOperationData(data):
    answer = {"method": 'setWeight'}
    try:
        type = data['type']
        data['row']['write_date'] = datetime.strptime(data['row']['write_date'], '%Y-%m-%d').date()
        if 'doc_date' in data['row']:
            if data['row']['doc_date'] != "":
                data['row']['doc_date'] = datetime.strptime(data['row']['doc_date'], '%Y-%m-%d').date()
            else:
                data['row']['doc_date'] = None
        else:
            data['row']['doc_date'] = None

        if 'wagon_number' in data['row']:
            if data['row']['wagon_number'] == '':
                data['row'].pop('wagon_number')
        if 'doc_start_weight' in data['row']:
            if data['row']['doc_start_weight'] == '':
                data['row'].pop('doc_start_weight')
        if 'doc_cargo_weight' in data['row']:
            if 'doc_cargo_weight' == '':
                data['row'].pop('doc_cargo_weight')
        if 'capacity' in data['row']:
            if data['row']['capacity'] == '':
                data['row'].pop('capacity')
        if 'train_number' in data['row']:
            if data['row']['train_number'] == '':
                data['row'].pop('train_number')
        if type == 'static.truck':
            data['weight_type'] = 'static'
            _data = data['row']
            id = _data['id']
            mass = Operation_table_static_truck.get(id=id)
            if mass:
                mass.set(**_data)
            else:
                Operation_table_static_truck(**_data)
            answer.update({"answer": 'ok', "params": {"message": 'Saved to operation table'}})
        elif type == 'static.wagon':
            data['weight_type'] = 'static'
            _data = data['row']
            id = _data['id']
            mass = Operation_table_static_wagon.get(id=id)
            if mass:
                mass.set(**_data)
            else:
                Operation_table_static_wagon(**_data)
            answer.update({"answer": 'ok', "params": {"message": 'Saved to operation table'}})
        elif type == 'dynamic':
            data['weight_type'] = 'dynamic'
            data['row']['speed'] = int(float(data['row']['speed']))
            _data = data['row']
            id = _data['id']
            mass = Operation_table_dynamic.get(id=id)
            if mass:
                mass.set(**_data)
            else:
                Operation_table_dynamic(**_data)
            answer.update({"answer": 'ok', "params": {"message": 'Saved to operation table'}})
        elif type == 'archive':
            data['weight_type'] = data['row']['weight_type']
            if data['row']['speed'] != None:
                data['row']['speed'] = int(float(data['row']['speed']))
            _data = data['row']
            id = _data['id']
            mass = Calculation.get(id=id)
            if mass:
                mass.set(**_data)
            else:
                Calculation(**_data)
            answer.update({"answer": 'ok', "params": {"message": 'Saved to operation table'}})
    except Exception as inst:
        sys_data = {"method": 'setWeight', "exeption": str(inst.args)}
        set_system_log(sys_data)
        print(inst)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def update_weight(data):
    answer = {"method": 'updateWeight'}
    try:
        row_to_delete = data['idToDel']
        type = data['type']
        data['row']['write_date'] = datetime.strptime(data['row']['write_date'], '%Y-%m-%d').date()
        if 'doc_date' in data['row']:
            if data['row']['doc_date'] != "":
                data['row']['doc_date'] = datetime.strptime(data['row']['doc_date'], '%Y-%m-%d').date()
            else:
                data['row']['doc_date'] = None
        else:
            data['row']['doc_date'] = None

        if 'wagon_number' in data['row']:
            if data['row']['wagon_number'] == '':
                data['row'].pop('wagon_number')
        if 'capacity' in data['row']:
            if data['row']['capacity'] == '':
                data['row'].pop('capacity')
        if type == 'static.truck':
            data['weight_type'] = 'static'
            _data = data['row']
            id = _data['id']
            mass = Operation_table_static_truck.get(id=id)
            mass.set(**_data)
            del_row = Operation_table_static_truck.get(id=row_to_delete)
            del_row.delete()
        elif type == 'static.wagon':
            data['weight_type'] = 'static'
            _data = data['row']
            id = _data['id']
            mass = Operation_table_static_wagon.get(id=id)
            mass.set(**_data)
            del_row = Operation_table_static_wagon.get(id=row_to_delete)
            del_row.delete()

        elif type == 'dynamic':
            data['weight_type'] = 'dynamic'
            data['row']['speed'] = int(float(data['row']['speed']))
            _data = data['row']
            id = _data['id']
            mass = Operation_table_dynamic.get(id=id)
            mass.set(**_data)
            del_row = Operation_table_dynamic.get(id=row_to_delete)
            del_row.delete()

        answer.update({"answer": 'ok', "params": {"message": 'Updated in operation table'}})
    except Exception as inst:
        sys_data = {"method": 'setWeight', "exeption": str(inst.args)}
        set_system_log(sys_data)
        print(inst)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_organization_name(name):
    answer = {"method": 'setOrganizationName'}
    try:
        settings = Global_settings.get(id=1)
        if settings:
            settings.set(organizationName=name)
        else:
            Global_settings(organizationName=name)
        answer.update({"answer": 'ok', "params": {"message": "Organization name is setted"}})
    except Exception as inst:
        sys_data = {"method": 'getLastVerification', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_last_verification():
    answer = {"method": 'getLastVerification'}
    try:
        verification = Strange_table.get(id=1)
        date = verification.to_dict()['LASTPOV']
        answer.update({"answer": 'ok', "params": {"date": date}})
    except Exception as inst:
        sys_data = {"method": 'getLastVerification', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer

@db_session
def set_last_verification(data):
    answer = {"method": 'setLastVerification'}
    try:
        verification = Strange_table.get(id=1)
        date_dict = {'LASTPOV': datetime.strptime(data, '%Y-%m-%d %H:%M')}
        verification.set(**date_dict)
        answer.update({"answer": 'ok', "params": {"message": "Verification date is setted"}})
    except Exception as inst:
        sys_data = {"method": 'setLastVerification', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_verification_archive(data):
    answer = {"method": 'setVerificationArchive'}
    try:
        Verification_archive(**data)
        answer.update({"answer": 'ok', "params": {"message": "Verification saved"}})
    except Exception as inst:
        sys_data = {"method": 'setVerificationArchive', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_verification_archive(data):
    answer = {"method": 'getVerificationArchive'}
    try:
        _data = []
        if data[0] == 'static':
            verification = Verification_archive.select()[:]
            for row in verification:
                _row = row.to_dict()
                if _row['weighing_type'] == "static":
                    _row['verification_date'] = _row['verification_date'].strftime('%Y-%m-%d')
                    _data.append(_row)
        else:
            verification = Verification_archive.select()[:]
            for row in verification:
                _row = row.to_dict()
                if _row['weighing_type'] == "dynamic":
                    _row['verification_date'] = _row['verification_date'].strftime('%Y-%m-%d')
                    _data.append(_row)

        answer.update({"answer": 'ok', "params": {"verifications": _data}})
    except Exception as inst:
        sys_data = {"method": 'getVerificationArchive', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_kleimo(data):
    answer = {"method": 'setKleimo'}
    try:
        kleimo = Kleimo.get(id=1)
        if kleimo:
            kleimo.set(kleimo=data)
        else:
            Kleimo(kleimo=data)
        answer.update({"answer": 'ok', "params": {"message": "kleimo was saved"}})
    except Exception as inst:
        sys_data = {"method": 'setKleimo', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_kleimo():
    answer = {"method": 'getKleimo'}
    try:
        _kleimo = Kleimo.get(id=1)
        if _kleimo:
            data = _kleimo.kleimo
            answer.update({"answer": 'ok', "params": [data]})
        else:
            answer.update({"answer": 'error', "params": "No kleimo"})
    except Exception as inst:
        sys_data = {"method": 'getKleimo', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_log(data):
    answer = {"method": 'setLog'}
    try:
        id = data['user']
        if id == '2' or id == 2:
            credentials = "Система"
        elif id == '1' or id == 1:
            credentials = "Аппаратное обеспечение"
        else:
            credentials = User.get(id=id).credentials
        data['user'] = credentials
        s_date = datetime.now().date()
        s_time = datetime.now().time()
        data.update({"date": s_date, "time": s_time})
        Events(**data)
        answer.update({"answer": 'ok', "params": []})
    except Exception as inst:
        sys_data = {"method": 'setLog', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_system_log(data):
    answer = {"method": 'setSystemLog'}
    try:
        s_date = datetime.now().date()
        s_time = datetime.now().time()
        data.update({"date": s_date, "time": s_time})
        System_events(**data)
        answer.update({"answer": 'ok', "params": []})
    except Exception as inst:
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_logs(data, user):
    answer = {"method": 'getLogs'}
    try:
        start = data['start']
        end = data['end']
        check = 0

        if start != "":
            check += 1
            s = datetime.strptime(start, '%Y-%m-%d %H:%M')
            start_date = s.date()
            start_time = s.time()
        if end != "":
            check += 2
            e = datetime.strptime(end, '%Y-%m-%d %H:%M')
            end_date = e.date()
            end_time = e.time()

        if check == 0:
            rows = Events.select()[:]
        elif check == 1:
            rows = Events.select(lambda s: s.date >= start_date and s.time >= start_time)[:]
        elif check == 2:
            rows = Events.select(lambda s: s.date <= end_date and s.time <= end_time)[:]
        else:
            rows = Events.select(lambda s: s.date >= start_date and s.time >= start_time and s.date <= end_date and s.time <= end_time)[:]

        if int(user) == 3:  # superadmin
            pre_answer = []
            for row in rows:
                dict_row = row.to_dict()
                dict_row['date'] = dict_row['date'].strftime('%Y-%m-%d')
                dict_row['time'] = dict_row['time'].strftime('%H:%M')
                pre_answer.append(dict_row)
        else: #other users
            pre_answer = []
            for row in rows:
                dict_row = row.to_dict()
                if dict_row['user'] != 3:
                    dict_row['date'] = dict_row['date'].strftime('%Y-%m-%d')
                    dict_row['time'] = dict_row['time'].strftime('%H:%M')
                    pre_answer.append(dict_row)

        answer.update({"answer": 'ok', "params": pre_answer})
    except Exception as inst:
        sys_data = {"method": 'getLogs', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_settings(user_id):
    answer = {"method": 'getSettings'}

    try:
        val = {}
        rows = User.select(lambda l: l.id == user_id)[:]
        if len(rows) != 0:

            for row in rows:
                keys = row._columns_
                vals = list(row._vals_.values())
                i = 0
                for j in keys:
                    val.update({str(j): vals[i]})
                    i += 1
            if val['password'] != "":
                val['password'] = "******"
            else:
                val['password'] = "Password is not setted"
            if val['user_name'] == None:
                val['user_name'] = "Login is not setted"
            answer.update({"answer": 'ok', "params": val})

        else:
            answer.update({"answer": 'warning', "params": {"message": 'User not found!'}})

    except Exception as inst:
        sys_data = {"method": 'getSettings', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_operation_table(params):
    answer = {"method": 'getOperationTable'}
    data = {}
    mass = []
    try:
        weight_type = params['type']
        if weight_type == 'static.truck':
            dat = Operation_table_static_truck.select().order_by(Operation_table_static_truck.write_date)[:]
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    data['write_date'] = data['write_date'].strftime('%Y-%m-%d')
                    data['write_time'] = data['write_time'].strftime('%H:%M')
                    if data['lastdateedited'] != None:
                        data['lastdateedited'] = data['lastdateedited'].strftime('%Y-%m-%d')
                    if data['lasttimeedited'] != None:
                        data['lasttimeedited'] = data['lasttimeedited'].strftime('%H:%M')
                    if data['doc_date'] != None:
                        data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d')
                    mass.append({**data})
                answer.update({"answer": 'ok', "params": mass})
            else:
                answer.update({"answer": 'warning', "params": {"message": 'Nothing to show'}})

        elif weight_type == 'static.wagon':
            dat = Operation_table_static_wagon.select().order_by(Operation_table_static_wagon.write_date)[:]
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    data['write_date'] = data['write_date'].strftime('%Y-%m-%d')
                    data['write_time'] = data['write_time'].strftime('%H:%M')
                    if data['lastdateedited'] != None:
                        data['lastdateedited'] = data['lastdateedited'].strftime('%Y-%m-%d')
                    if data['lasttimeedited'] != None:
                        data['lasttimeedited'] = data['lasttimeedited'].strftime('%H:%M')
                    if data['doc_date'] != None:
                        data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d')
                    mass.append({**data})
                answer.update({"answer": 'ok', "params": mass})
            else:
                answer.update({"answer": 'warning', "params": {"message": 'Nothing to show'}})

        elif weight_type == 'dynamic':
            dat = Operation_table_dynamic.select().order_by(Operation_table_dynamic.write_date)[:]
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    data['write_date'] = data['write_date'].strftime('%Y-%m-%d')
                    data['write_time'] = data['write_time'].strftime('%H:%M')
                    if data['lastdateedited'] != None:
                        data['lastdateedited'] = data['lastdateedited'].strftime('%Y-%m-%d')
                    if data['lasttimeedited'] != None:
                        data['lasttimeedited'] = data['lasttimeedited'].strftime('%H:%M')
                    if data['doc_date'] != None:
                        data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d')
                    mass.append({**data})
                answer.update({"answer": 'ok', "params": mass})
            else:
                answer.update({"answer": 'warning', "params": {"message": 'Nothing to show'}})

    except Exception as inst:
        sys_data = {"method": 'getOperationTable', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_camera(data):
    answer = {"method": 'setCamera'}
    try:
        if 'id' in data:
            mass = Cameras.get(id=data['id'])
            if mass:
                mass.set(**data)
            else:
                Cameras(**data)
        else:
            mass = Cameras.select()[:]
            if mass:
                _id = max(s.id for s in Cameras) + 1
            else:
                _id = 1
            data['id'] = _id
            Cameras(**data)
        answer.update({"answer": 'ok', "params": {"message": 'Camera settings is setted'}})
    except Exception as inst:
        sys_data = {"method": 'setCamera', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_cameras():
    answer = {"method": 'getCameras'}
    try:
        mass = []
        rows = Cameras.select()[:]
        for row in rows:
            dict_row = row.to_dict()
            mass.append(dict_row)
        answer.update({"answer": 'ok', "params": mass})
    except Exception as inst:
        sys_data = {"method": 'getCameras', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_camera(camera_id):
    answer = {"method": "getCamera"}

    try:
        camera = Cameras.get(id=camera_id)

        dict_row = camera.to_dict()

        answer.update({"answer": 'ok', "params": dict_row})

    except Exception as inst:
        sys_data = {"method": "getCamera", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def del_camera(camera_id):
    answer = {"method": "delCamera"}

    try:
        camera = Cameras.get(id=camera_id)

        camera.delete()

        answer.update({"answer": 'ok', "params": {"message": "Camera was deleted"}})

    except Exception as inst:
        sys_data = {"method": "delCamera", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def set_settings(data):
    answer = {"method": 'setSettings'}
    try:
        if data['user_name'] == []:
            data['user_name'] = None
        if 'id' in data:
            user = data['id']
            mass = User.get(id=user)
            if mass:
                mass.set(**data)
            else:
                User(**data)
        else:
            _id = max(s.id for s in User) + 1
            data['id'] = _id
            User(**data)
        answer.update({"answer": 'ok', "params": {"message": 'user settings is setted'}})

    except Exception as inst:
        sys_data = {"method": 'setSettings', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_globals(data):
    answer = {"method": 'setGlobals'}
    try:
        row = Global_settings.get(id=1)

        if row:
            row.set(**data)

        else:
            Global_settings(**data)
    except Exception as inst:
        sys_data = {"method": 'setGlobals', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_globals():
    answer = {"method": 'getGlobals'}
    try:
        rows = Global_settings.get(id=1)
        if rows:
            val = rows.to_dict()
            val['blockinTime'] = val['blockinTime'].strftime("%Y-%m-%d")
            answer.update({"answer": 'ok', "params": val})
        else:
            answer.update({"answer": 'error', "params": {"message": "No global data"}})

    except Exception as inst:
        sys_data = {"method": 'getGlobals', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def set_hid_options(data, user):
    answer = {"method": 'setHidOptions'}
    try:
        type = data['type']
        hid = data['columns']
        if type == "static.truck":
            mass = Hid_options_static_truck.get(user=user)
            if mass:
                mass.set(**hid)
            else:
                Hid_options_static_truck(**hid)
            answer.update({"answer": 'ok', "params": {"message": "Hid_options was setted"}})

        elif type == "static.wagon":
            mass = Hid_options_static_wagon.get(user=user)
            if mass:
                mass.set(**hid)
            else:
                Hid_options_static_wagon(**hid)
            answer.update({"answer": 'ok', "params": {"message": "Hid_options was setted"}})

        elif type == "dynamic":
            mass = Hid_options_dynamic.get(user=user)
            if mass:
                mass.set(**hid)
            else:
                Hid_options_dynamic(**hid)
            answer.update({"answer": 'ok', "params": {"message": "Hid_options was setted"}})

        else:
            mass = Hid_options_archive.get(user=user)
            if mass:
                mass.set(**hid)
            else:
                Hid_options_archive(**hid)
            answer.update({"answer": 'ok', "params": {"message": "Hid_options was setted"}})
    except Exception as inst:
        sys_data = {"method": 'setHidOptions', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def get_hid_options(data, user):
    answer = {"method": 'getHidOptions'}
    try:

        type = data['type']
        if type == "static.truck":
            checkuser = Hid_options_static_truck.get(user=user)

        elif type == "static.wagon":
            checkuser = Hid_options_static_wagon.get(user=user)

        elif type == "dynamic":
            checkuser = Hid_options_dynamic.get(user=user)

        else:
            checkuser = Hid_options_archive.get(user=user)

        if checkuser:
            val = checkuser.to_dict()
            del val['user']
            mass = {'id': val['id']}
            for i in val.keys():
                if i != 'id' and val[i]:
                    mass.update({str(val[i]): i})
            answer.update({"answer": 'ok', "params": {"type": type, "collumns": mass}})
        else:
            answer.update({"answer": 'warrning', "params": {"message": "User %d havent hid_options in %s type" % (int(user), type)}})

    except Exception as inst:
        sys_data = {"method": 'getHidOptions', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def re_weight(data):
    answer = {"method": 'reWeigh'}

    try:
        weight_type = data['type']
        row_id = data['id']
        if weight_type != "_dynamic":
            data_to_copy = Calculation.get(id=row_id)
            if data_to_copy:
                dict_data = data_to_copy.to_dict()
                data_to_copy.delete()
                dict_data['lastdateedited'] = datetime.now().strftime("%Y-%m-%d")
                dict_data['lasttimeedited'] = datetime.now().strftime("%H:%M")
                dict_data['lasttimeeditor'] = data['user']
                type = dict_data['type']
                if type == "static.truck":
                    max_id = max(s.id for s in Operation_table_static_truck)
                    if max_id:
                        _id = max_id + 1
                    else:
                        _id = 1
                    dict_data['id'] = _id
                    dict_data.pop('direction')
                    dict_data.pop('speed')
                    dict_data.pop('weight_type')
                    dict_data.pop('ft_axis_1')
                    dict_data.pop('ft_axis_2')
                    dict_data.pop('ft_axis_3')
                    dict_data.pop('ft_axis_4')
                    dict_data.pop('st_axis_1')
                    dict_data.pop('st_axis_2')
                    dict_data.pop('st_axis_3')
                    dict_data.pop('st_axis_4')
                    Operation_table_static_truck(**dict_data)
                elif type == "static.wagon":
                    max_id = max(s.id for s in Operation_table_static_wagon)
                    if max_id:
                        _id = max_id + 1
                    else:
                        _id = 1
                    dict_data['id'] = _id
                    dict_data.pop('direction')
                    dict_data.pop('speed')
                    dict_data.pop('weight_type')
                    dict_data.pop('ft_axis_1')
                    dict_data.pop('ft_axis_2')
                    dict_data.pop('ft_axis_3')
                    dict_data.pop('ft_axis_4')
                    dict_data.pop('st_axis_1')
                    dict_data.pop('st_axis_2')
                    dict_data.pop('st_axis_3')
                    dict_data.pop('st_axis_4')
                    Operation_table_static_wagon(**dict_data)
                elif type == "dynamic":
                    max_id = max(s.id for s in Operation_table_dynamic)
                    if max_id:
                        _id = max_id + 1
                    else:
                        _id = 1
                    dict_data['id'] = _id
                    dict_data.pop('weight_type')
                    Operation_table_dynamic(**dict_data)
                else:
                    answer.update(
                        {"answer": 'error', "params": {"message": "havent %d with %s type" % (row_id, type)}})

                answer.update(
                    {"answer": 'ok', "params": {"type": type, "message": "Moved to operation table, weight is resetted"}})
            else:
                answer.update(
                    {"answer": 'error', "params": {"message": "No such id"}})
        else:
            row = Operation_table_dynamic.get(id=row_id)
            row.delete()
            answer.update(
                {"answer": 'ok', "params": {"message": "deleted from operation table, weight is resetted"}})
    except Exception as inst:
        sys_data = {"method": 'reWeigh', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def del_weight(data):
    answer = {"method": 'delWeight'}

    try:
        weight_type = data['type']
        row_id = data['id']
        if weight_type == "static.truck":
            data_to_copy = Operation_table_static_truck.get(id=row_id)
            data_to_copy.delete()
        elif weight_type == "static.wagon":
            data_to_copy = Operation_table_static_wagon.get(id=row_id)
            data_to_copy.delete()
        elif weight_type == "dynamic":
            data_to_copy = Operation_table_dynamic.get(id=row_id)
            data_to_copy.delete()
        answer.update({"answer": 'ok', "params": {"message": "deleted from operation table"}})
    except Exception as inst:
        sys_data = {"method": 'delWeight', "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


@db_session
def checkValidationData(data):
    answer = {"method": 'check.validation'}

    try:
        user_name = data['login']
        password = data['password']
        checkUserName = User.get(user_name=user_name)
        if checkUserName:
            checkpassword = User.get(user_name=user_name, password=password)
            if checkpassword:
                rows = User.select(lambda l: l.user_name == user_name)[:]
                for row in rows:
                    val = row.to_dict()
                answer.update({'answer': "ok", 'params': val})
            else:
                answer = None
        else:
            answer = None

    except Exception as inst:
        sys_data = {'method': "check.validation", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer = None
    return answer


@db_session
def get_users(user_id):
    answer = {"method": 'getUsers'}
    mass = []
    try:
        rows = User.select()[:]
        if int(user_id) == 3:
            for row in rows:
                dict_row = row.to_dict()
                mass.append(dict_row)
            answer.update({"answer": 'ok', "params": mass})
        else:
            for row in rows:
                if row.id != 3:
                    dict_row = row.to_dict()
                    mass.append(dict_row)
            answer.update({"answer": 'ok', "params": mass})

    except Exception as inst:
        sys_data = {'method': "getUsers", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args[0]}})
    return answer


@db_session
def set_cargo(name):
    answer = {"method": 'setCargo'}
    try:
        row = Cargo_name.get(name=name)
        if row:
            answer.update({"answer": 'warning', "params": {"message": "that cargo is already exist"}})

        else:
            Cargo_name(name=name)
            answer.update({"answer": 'ok', "params": {"message": "cargo was setted"}})

    except Exception as inst:
        sys_data = {'method': "setCargo", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def get_cargos():
    answer = {"method": 'getCargos', "params": {"cargos": []}}

    try:
        cargos = []
        rows = Cargo_name.select()[:]
        for row in rows:
            a = row.to_dict()
            cargos.append(a['name'])
        answer['params']['cargos'] = cargos

    except Exception as inst:
        sys_data = {'method': "getCargos", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer

@db_session
def set_cargo_name(name):
    answer = {"method": 'setCargoName'}
    try:
        row = CargoName_name.get(name=name)
        if row:
            answer.update({"answer": 'warning', "params": {"message": "that cargo is already exist"}})

        else:
            CargoName_name(name=name)
            answer.update({"answer": 'ok', "params": {"message": "cargo was setted"}})

    except Exception as inst:
        sys_data = {'method': "setCargoName", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def get_cargonames():
    answer = {"method": 'getCargoNames', "params": {"cargonames": []}}

    try:
        cargos = []
        rows = CargoName_name.select()[:]
        for row in rows:
            a = row.to_dict()
            cargos.append(a['name'])
        answer['params']['cargonames'] = cargos

    except Exception as inst:
        sys_data = {'method': "getCargoNames", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer

@db_session
def set_serial(data, cpu_info):
    answer = {"method": 'setSerial'}

    try:
        serial = data['serial']
        snw = data['number']
        check_serial = Serial.get(serial=serial)

        if check_serial:
            answer.update({"answer": 'error', "params": {"message": "that serial key is already in use"}})

        else:

            sd = serial.split('-')
            f_part = sd[0][:-3]
            s_part = sd[1][:-3]
            t_part = str(int(sd[2][:-2]) // int(snw))

            mass = list(sd[0][-3:] + sd[1][-3:] + sd[2][-2:])

            b = mass[0:4]
            mass[0:4] = mass[4:]
            mass[4:] = b

            for i in range(0, 8, 2):
                a = mass[i]
                mass[i] = mass[i + 1]
                mass[i + 1] = a

            check_proc = "".join(mass)

            if check_proc == cpu_info:
                pwd = serial.encode('utf-8')
                pwd = hashlib.md5(pwd).hexdigest()
                password = pwd[2:4] + pwd[7] + pwd[0] + pwd[3:5] + pwd[-3:-1]

                qq = []
                for i in range(0, 6, 2):
                    qq.append(str(int(f_part[i], 16) + int(s_part[5 - i], 16)))

                q = ""
                for i in qq:
                    q += i
                if str(int(q)) == t_part:
                    full_str = f_part + s_part

                    mas2 = []
                    for i in full_str:
                        mas2.append(i)

                    for i in range(1, 6, 2):
                        a = mas2[10 - i]
                        mas2[10 - i] = mas2[i]
                        mas2[i] = a

                    qq = ""
                    for i in mas2:
                        qq += i

                    int_code = str(int(int(qq.lower(), 16) / 256))

                    mas2 = []
                    for i in int_code:
                        mas2.append(i)

                    for i in [10, 9, 8, 7, 6, 5, 4]:
                        a = mas2[i]
                        mas2[i] = mas2[i - 4]
                        mas2[i - 4] = a

                    qq = ""
                    for i in mas2:
                        qq += i

                    code = qq[:3]
                    date = datetime.strptime(qq[3:], '%d%m%Y').date()

                    row = Keys.get(key=code)
                    if row:
                        settings = row.to_dict()
                        settings.pop('id')
                        settings.pop('key')
                        settings.update({"blockinTime": date, "weigherNumber": snw})
                        set_globals(settings)
                        Serial(serial=serial)
                        user_data = {"id": 4, 'user_name': "admin", 'credentials': "Администратор", 'password': password,
                                     'phonenumber': "",
                                     'backup': True, 'explore_weight_arch': True, 'explore_logs': True, 'printing': True,
                                     'adding_arch_data': True, 'cancel_weighting': True, 'change_arch_data': True,
                                     'add_user': True,
                                     'change_wagon_number': True, 'locale': "ru", 'theme': "light", 'verification': True,
                                     'configuration': True, 'save_archive': True, 'save_events': True,
                                     'table_configuration': True,
                                     'tara_control': True, 'calibration': True, 'update_speed': 5}
                        set_settings(user_data)
                        answer.update({"answer": 'ok', "params": {"message": "serial was setted"}})
                    else:
                        answer.update({"answer": 'error', "params": {"message": "that serial key is incorrect(001)"}})
                else:
                    answer.update({"answer": 'error', "params": {"message": "that serial key is incorrect"}})
            else:
                answer.update({"answer": 'error', "params": {"message": "that serial key is incorrect or out of date"}})

    except Exception as inst:
        sys_data = {'method': "setSerial", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": "that serial key is incorrect(e001)"}})
    return answer


@db_session
def setPartnerName(data):
    partner = Partner(**data)
    return partner


@db_session
def setUserName(data):

    partner = User(**data)
    return partner


@db_session
def set_destination_point(name):
    answer = {"method": 'setDestPoint'}
    try:
        row = Destination_name.get(name=name)
        if row:
            answer.update({"answer": 'warning', "params": {"message": "that point is already exist"}})

        else:
            Destination_name(name=name)
            answer.update({"answer": 'ok', "params": {"message": "point was setted"}})

    except Exception as inst:
        sys_data = {'method': "setDestPoint", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def get_destination_points():
    answer = {"method": 'getCargos'}

    try:
        points = []
        rows = Destination_name.select()[:]
        for row in rows:
            a = row.to_dict()
            points.append(a['name'])
        answer.update({"answer": 'ok', "params": {"points": points}})

    except Exception as inst:
        sys_data = {'method': "getCargos", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def setOptionalName(name):
    oname = Optional_names(name=name)
    return oname


@db_session
def strange_table():
    data = Strange_table.get()
    vals = list(data._vals_.values())
    return vals

@db_session
def save_strange_table(data):

    try:

        row = Strange_table.get(id=1)
        if row:
            row.set(**data)
        else:
            Strange_table(**data)
    except Exception as inst:
        sys_data = {'method': "save_strange_table", "exeption": str(inst.args)}
        set_system_log(sys_data)
        print(inst.args)


@db_session
def set_report(data):
    answer = {"method": "setReport"}

    try:
        settings = data['settings']
        columns = data['columns']
        name = settings['name']
        id_exists = 'id' in settings
        if id_exists:
            _id = settings['id']
            a = Report_settings.get(id=_id)
            a.set(**settings)
            row_id = a.id
            mass = {"id": row_id}
            #for i in columns.keys():
            mass.update(columns)
            rows = Report_columns.get(id=row_id)
            rows.set(**mass)
            answer.update({"answer": 'ok', "params": {"message": "Report is setted"}})
            return answer

        else:
            Report_settings(**settings)
            _idd = max(s.id for s in Report_settings)
            a = Report_settings.get(id=_idd)

            row_id = a.id
            mass = {"id": row_id}

        #for i in columns.keys():
            mass.update(columns)
        Report_columns(**mass)

        answer.update({"answer": 'ok', "params": {"message": "Report is setted"}})
    except Exception as inst:
        sys_data = {'method': "setReport", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def set_protocol(data):
    answer = {"method": "setProtocol"}
    data['port'] = (int)(data['port'])
    if 'id' in data:
        if data['id'] == "":
            del data['id']
    try:
        id_exists = 'id' in data

        if id_exists:
            id = data['id']
            row = Protocol.get(id=id)
            row.set(**data)
            answer.update({"answer": 'ok', "params": {"message": "Protocol is rewrited"}})

        else:
            Protocol(**data)
            answer.update({"answer": 'ok', "params": {"message": "Protocol is setted"}})

    except Exception as inst:
        sys_data = {'method': "setProtocol", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_protocols():
    answer = {"method": "getProtocols"}

    try:
        data = []
        rows = select((f.id, f.name, f.IP, f.markCheckbox) for f in Protocol).order_by(1)
        for row in rows:
            dict_row = {"id": row[0], "name": row[1], "IP": row[2], "markCheckbox": row[3]}
            data.append(dict_row)

        if data == {}:
            answer["message"] = "Nothing to show"
        answer.update({"answer": 'ok', "params": data})

    except Exception as inst:
        sys_data = {'method': "getProtocols", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_protocol(id):
    answer = {"method": "getProtocol"}

    try:
        row = Protocol.get(id=id)

        if row:
            dict_row = row.to_dict()

            answer.update({"answer": 'ok', "params": dict_row})

        else:
            answer.update({"answer": 'ok', "params": {"message": "Havent protocol with that id"}})

    except Exception as inst:
        sys_data = {'method': "getProtocol", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def switch_protocol(data):
    answer = {"method": "switchProtocol"}

    try:
        rep_id = data['id']
        flag = data['markCheckbox']

        row = Protocol.get(id=rep_id)
        if row:
            row.set(markCheckbox=flag)
            answer.update({"answer": 'ok', "params": {"message": "Protocol switched"}})
        else:
            answer.update({"answer": 'warrning', "params": {"message": "No such id"}})

    except Exception as inst:
        sys_data = {'method': "switchProtocol", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer

@db_session
def set_contractor(contractor):
    answer = {"method": "setContractor"}
    if contractor['inn'] == "":
        del contractor['inn']
    if contractor['kpp'] == "":
        del contractor['kpp']
    try:
        Contractor(**contractor)
        answer.update({"answer": 'ok', "params": {"message": "Contractor is setted"}})

    except Exception as inst:
        sys_data = {'method': "setContractor", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def del_protocol(id):
    answer = {"method": "delProtocol"}

    try:
        row = Protocol.get(id=id)
        row.delete()

        answer.update({"answer": 'ok', "params": {"message": "Protocol was deleted"}})

    except Exception as inst:
        sys_data = {'method': "delProtocol", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer



@db_session
def get_contractors():
    answer = {"method": "getContractors"}

    try:
        rows = Contractor.select()[:]
        if rows:
            contractors = {}
            for row in rows:
                if row.shortName in list(contractors.keys()):
                    new_name = row.shortName + "(" + str(row.id) + ")"
                    contractors.update({new_name.replace('"', ''): row.shortName})
                else:
                    contractors.update({row.shortName.replace('"', ""): row.shortName})

            answer.update({"answer": 'ok', "params": {"contractors": contractors}})
        else:
            answer.update({"answer": 'ok', "params": {"message": "Nothing to show"}})

    except Exception as inst:
        sys_data = {'method': "getContractors", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_last_dyn_id():
    row = Operation_table_dynamic.select()
    if row:
        row_id = max(s.id for s in Operation_table_dynamic) + 1
    else:
        row_id = 1
    return row_id


@db_session
def get_report(report_id):
    answer = {"method": "getReport"}

    try:
        row = Report_columns.get(id=report_id)

        dict_row = row.to_dict()
        mass = {'id': report_id}
        for i in dict_row.keys():
            if i != 'id' and dict_row[i]:
                mass.update({str(dict_row[i]): i})

        row = Report_settings.get(id=report_id)
        dict_row = row.to_dict()

        answer.update({"answer": 'ok', "params": {"settings": dict_row, "columns": mass}})

    except Exception as inst:
        sys_data = {'method': "getReport", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def delete_user(user_id):
    answer = {"method": "delUser"}

    try:
        if user_id == '3' or user_id == 3:

            answer.update({"answer": 'error', "params": {"message": "You can not delete superuser"}})
        elif user_id == '4' or user_id == 4:

            answer.update({"answer": 'error', "params": {"message": "You can not delete admin"}})
        else:

            user = User.get(id=user_id)

            user.delete()

            answer.update({"answer": 'ok', "params": {"message": "User deleted"}})

    except Exception as inst:
        sys_data = {'method': "delUser", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer

@db_session
def get_reports():
    answer = {"method": "getReports"}
    settings = []
    try:
        rows = select((f.id, f.name, f.count, f.markCheckbox) for f in Report_settings).order_by(1)
        for row in rows:
            dict_row = {"id": row[0], "name": row[1], "count": row[2], "markCheckbox": row[3]}
            settings.append(dict_row)

        answer.update({"answer": 'ok', "params": settings})

    except Exception as inst:
        sys_data = {'method': "getReports", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_active_reports():
    answer = []
    settings = []
    try:
        rows = select((f.id, f.name, f.count, f.markCheckbox) for f in Report_settings).order_by(1)
        for row in rows:
            if row[3] == True:
                dict_row = {"id": row[0], "value": row[1]}
                settings.append(dict_row)

        answer = settings

    except Exception as inst:
        sys_data = {'method': "get_active_reports", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer = {'method': "get_active_reports", 'answer': "error", "params": {"message": inst.args}}
    return answer


@db_session
def del_report(report_id):
    answer = {"method": "delReport"}

    try:
        settings = Report_settings.get(id=report_id)
        columns = Report_columns.get(id=report_id)

        settings.delete()
        columns.delete()

        answer.update({"answer": 'ok', "params": {"message": "Report deleted"}})

    except Exception as inst:
        sys_data = {'method': "delReport", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def switch_report(data):
    answer = {"method": "switchReport"}

    try:
        rep_id = data['id']
        flag = data['markCheckbox']

        row = Report_settings.get(id=rep_id)
        if row:
            row.set(markCheckbox=flag)
            answer.update({"answer": 'ok', "params": {"message": "Report switched"}})
        else:
            answer.update({"answer": 'warrning', "params": {"message": "No such id"}})

    except Exception as inst:
        sys_data = {'method': "switchReport", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_archive(data):
    answer = {"method": "getArchive"}

    try:
        start = data['start']
        end = data['end']

        check = 0

        if start != "":
            check += 1
            s = datetime.strptime(start, '%Y-%m-%d %H:%M')
            start_date = s.date()
            start_time = s.time()
        if end != "":
            check += 2
            e = datetime.strptime(end, '%Y-%m-%d %H:%M')
            end_date = e.date()
            end_time = e.time()

        if check == 0:
            rows = Calculation.select()[:]
        elif check == 1:
            rows = Calculation.select(lambda s: s.write_date >= start_date and s.write_time >= start_time)[:]
        elif check == 2:
            rows = Calculation.select(lambda s: s.write_date <= end_date and s.write_time <= end_time)[:]
        else:
            rows = Calculation.select(lambda s: s.write_date >= start_date and s.write_time >= start_time and s.write_date <= end_date and s.write_time <= end_time)[:]

        pre_answer = []
        for row in rows:

            dict_row = row.to_dict()
            dict_row['write_date'] = dict_row['write_date'].strftime('%Y-%m-%d')
            dict_row['write_time'] = dict_row['write_time'].strftime('%H:%M')
            if dict_row['doc_date'] != None:
                dict_row['doc_date'] = dict_row['doc_date'].strftime('%Y-%m-%d')
            if dict_row['lastdateedited'] != None:
                dict_row['lastdateedited'] = dict_row['lastdateedited'].strftime('%Y-%m-%d')
            if dict_row['lasttimeedited'] != None:
                dict_row['lasttimeedited'] = dict_row['lasttimeedited'].strftime('%H:%M')
            pre_answer.append(dict_row)

        answer.update({"answer": 'ok', "params": pre_answer})

    except Exception as inst:
        sys_data = {'method': "getArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def set_archive(params):
    answer = {"method": "setArchive"}
    try:
        data = {}
        id = params['id']
        weight_type = params['type']
        if weight_type == 'static.truck':
            dat = Operation_table_static_truck.select(lambda l: l.id == id)[:]
            _dat = Operation_table_static_truck.get(id=id)
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    del data['id']
                    Calculation(**data)
                    _dat.delete()
                answer.update({"answer": 'ok', "params": "Archive data is setted"})
            else:
                answer.update({"answer": 'warning', "params": {"message": 'Internal error: no such row in operation table'}})
        elif weight_type == 'static.wagon':
            dat = Operation_table_static_wagon.select(lambda l: l.id == id)[:]
            _dat = Operation_table_static_wagon.get(id=id)
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    del data['id']
                    Calculation(**data)
                    departure_point = data['departure_point']
                    destintation_point = data['destination_point']
                    answer_set_destination_point = set_destination_point(departure_point)
                    if answer_set_destination_point == 'ok' or answer_set_destination_point == 'warning':
                        pass
                    else:
                        print("ERROR IN set_destination_point")
                    answer_set_destination_point = set_destination_point(destintation_point)
                    if answer_set_destination_point == 'ok' or answer_set_destination_point == 'warning':
                        pass
                    else:
                        print("ERROR IN set_destination_point")
                    cargo = data['cargo']
                    answer_set_cargo = set_cargo(cargo)['answer']
                    if answer_set_cargo == 'ok' or answer_set_cargo == 'warning':
                        pass
                    else:
                        print("ERROR IN set_destination_point")
                    _dat.delete()
                    answer.update({"answer": 'ok', "params": "Archive data is setted"})
            else:
                answer.update({"answer": 'warning', "params": {"message": 'Internal error: no such row in operation table'}})
        elif weight_type == 'dynamic':
            dat = Operation_table_dynamic.select(lambda l: l.id == id)[:]
            _dat = Operation_table_dynamic.get(id=id)
            if dat:
                for row in dat:
                    keys = row._columns_
                    vals = list(row._vals_.values())
                    i = 0
                    for j in keys:
                        data.update({str(j): vals[i]})
                        i += 1
                    del data['id']
                    Calculation(**data)
                    _dat.delete()
                    answer.update({"answer": 'ok', "params": "Archive data is setted"})
            else:
                answer.update(
                    {"answer": 'warning', "params": {"message": 'Internal error: no such row in operation table'}})
    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
    return answer


@db_session
def get_cal_points():

    rows = Cal_points1.select()[:]
    vals = []
    points = {}
    for row in rows:
        row_vals = list(row._vals_.values())[1:]
        vals.append(row_vals)
    weights = []
    for i in range(10):
        weights.append(vals[i][0])
    points.update({"1": weights})

    rows = Cal_points2.select()[:]
    vals = []
    for row in rows:
        row_vals = list(row._vals_.values())[1:]
        vals.append(row_vals)
    weights = []
    for i in range(10):
        weights.append(vals[i][0])

    points.update({"2": weights})

    return points


@db_session
def save_cal_points(points):

    weights1 = points['1']
    weights2 = points['2']

    for i in range(10):
        row1 = Cal_points1.get(id=i + 1)
        row2 = Cal_points2.get(id=i + 1)
        if row1:
            row1.set(id=(i + 1), weight=weights1[i])
        else:
            Cal_points1(id=(i + 1), weight=weights1[i])
        if row2:
            row2.set(id=(i + 1), weight=weights2[i])
        else:
            Cal_points2(id=(i + 1), weight=weights2[i])


@db_session
def get_adc_settings():

    rows = Adcs_settings.select()[:]
    vals = []
    for row in rows:
        row_vals = list(row._vals_.values())[1:]
        vals.append(row_vals)


    return vals


@db_session
def save_adc_settings(inv, adcch, offset=None):

    if not offset:
        for i in range(8):
            INV = inv[i]
            ADCCH = adcch[i]

            row = Adcs_settings.get(id=i + 1)
            if row:
                row.set(INV=INV, ADCCH=ADCCH)
            else:
                Adcs_settings(INV=INV, ADCCH=ADCCH)
    else:
        for i in range(8):
            INV = inv[i]
            ADCCH = adcch[i]
            OFFSET = int(offset[i])

            row = Adcs_settings.get(id=i + 1)
            if row:
                row.set(INV=INV, ADCCH=ADCCH, OFFSET=OFFSET)
            else:
                Adcs_settings(INV=INV, ADCCH=ADCCH, OFFSET=OFFSET)


@db_session
def save_cal_tables(table):
    table0 = table[0]
    table1 = table[1]
    table2 = table[2]
    table3 = table[3]
    table4 = table[4]
    table5 = table[5]
    table6 = table[6]
    table7 = table[7]

    for i in range(10):
        row = Cal_table0.get(id=(i + 1))
        data = table0[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table0(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)


    for i in range(10):
        row = Cal_table1.get(id=(1 + i))
        data = table1[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table1(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table2.get(id=(1 + i))
        data = table2[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table2(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table3.get(id=(1 + i))
        data = table3[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table3(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table4.get(id=(1 + i))
        data = table4[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table4(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table5.get(id=(1 + i))
        data = table5[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table5(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table6.get(id=(1 + i))
        data = table6[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table6(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)

    for i in range(10):
        row = Cal_table7.get(id=(1 + i))
        data = table7[i]
        OFFSET = data[0]
        MASS = data[1]
        CODE = data[2]
        if row:
            row.set(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)
        else:
            Cal_table7(id=(i + 1), OFFSET=OFFSET, MASS=MASS, CODE=CODE)


@db_session
def get_cal_tables():
    data = []

    table = Cal_table0.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table1.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table2.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table3.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table4.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table5.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table6.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)

    table = Cal_table7.select().order_by(1)[:]
    vals = []
    for row in table:
        vals.append(list(row._vals_.values())[1:])
    data.append(vals)
    return data


def delete_table(table_name):

    db.drop_table(table_name, True, True)


def delete_base():

    db.drop_all_tables(True)

def hascyr(s):
    lower = set(' абвгдеёжзийклмнопрстуфхцчшщъыьэюя')

    return lower.intersection(s.lower()) != set()

def save_data(file, method):
    answer = {"method": method}
    try:
        comand_string = ""
        checkname = file
        filename_mass = checkname.split(".")
        if filename_mass[-1] != "dump":
            file = file + ".dump"
        stri = os.getcwd() + '/backups/' + file
        mass = stri.split("\\")
        filepath = ""
        for i in range(len(mass) - 1):
            check = hascyr(mass[i])
            if check:
                mass[i] = '"' + mass[i] + '"'
            filepath = filepath + mass[i] + "\\"
        filepath = filepath + mass[-1]
        f_part = "pg_dump -U postgres "
        s_part = "vtvbase > " + filepath

        if method == "saveBackup":
            comand_string = f_part + s_part

        elif method == "saveCalibration":
            table_string = "-t adc_data -t adcs_settings -t cal_points1 -t cal_points2 -t strange_table -t cal_table0 -t cal_table1 -t cal_table2 -t cal_table3 -t cal_table4 -t cal_table5 -t cal_table6 -t cal_table7 -t kleimo "
            comand_string = f_part + table_string + s_part

        elif method == "saveLogs":
            table_string = "-t events -t system_events "
            comand_string = f_part + table_string + s_part

        elif method == "saveArchive":
            table_string = '-t calculation '
            comand_string = f_part + table_string + s_part

        temp = os.system(comand_string)
        answer.update({"answer": 'ok', "params": {"message": filepath}})
    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


def test():
    answer = {}
    stri = os.getcwd() + '\\backups\\' + "blablaa"
    mass = stri.split("\\")
    filepath = ""
    for i in range(len(mass) - 1):
        check = hascyr(mass[i])
        if check:
            mass[i] = '"' + mass[i] + '"'
        filepath = filepath + mass[i] + "\\"
    filepath = filepath + mass[-1]
    comand_string = "mkdir " + filepath
    os.system(comand_string)
    answer.update({"answer": 'ok', "params": str(filepath)})

    return answer

def upload_data(file, method):
    answer = {"method": method}
    try:
        stri = os.getcwd() + '/backups/' + file
        mass = stri.split("\\")
        filepath = ""
        for i in range(len(mass) - 1):
            check = hascyr(mass[i])
            if check:
                mass[i] = '"' + mass[i] + '"'
            filepath = filepath + mass[i] + "\\"
        filepath = filepath + mass[-1]
        comand_string = "psql -U postgres vtvbase < " + filepath
        if method == "Backup":
            delete_base()

        elif method == "Calibration":
            tables = ['adc_data', 'adcs_settings', 'cal_points1', 'cal_points2', 'strange_table', 'cal_table0',
                      'cal_table1', 'cal_table2', 'cal_table3', 'cal_table4', 'cal_table5', 'cal_table6', 'cal_table7', 'kleimo']
            for i in tables:
                delete_table(i)

        elif method == "Logs":
            tables = ['events', 'system_events']
            for i in tables:
                delete_table(i)

        elif method == "Archive":
            delete_table('calculation')

        os.system(comand_string)

        weight_math.COLLECT()
        answer.update({"answer": 'ok', "params": {"message": method + " data was uploaded"}})
    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def set_hardware(data):
    answer = {"method": "setHardware"}

    try:
        row = Hardware.get(id=1)
        if row:
            row.set(**data)
        else:
            Hardware(**data)

        answer.update({"answer": 'ok', "params": {"message": "Data is saved"}})

    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def get_hardware():
    answer = {"method": "getHardware"}

    try:
        row = Hardware.get(id=1)
        data = row.to_dict()

        answer.update({"answer": 'ok', "params": data})
    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def set_hardware_info(data):
    answer = {"method": "setHardwareInfo"}

    try:
        row = HardwareInfo.get(id=1)
        if row:
            row.set(**data)
        else:
            HardwareInfo(**data)
        answer.update({"answer": 'ok', "params": {"message": "Data is saved"}})

    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer


@db_session
def get_hardware_info():
    answer = {"method": "getHardwareInfo"}

    try:
        row = HardwareInfo.get(id=1)
        if row != None:
            data = row.to_dict()
        else:
            data = {"id": 1, "weight_type": "", "nomersi": "", "accuracy": "", "weight_number": ""}
        answer.update({"answer": 'ok', "params": data})

    except Exception as inst:
        sys_data = {'method': "setArchive", "exeption": str(inst.args)}
        set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})

    return answer
