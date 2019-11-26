import os
import json
import sqlDriver
import recognition
import weight_math
import serial_comports
import hashlib
import datetime
import platform
adc_check = [1, 2, 3, 4, 5, 6, 7, 8]
pdo = False
flag_to_close = False


def cpu_info():
    if platform.system() == 'Windows':
        pltfrm = platform.processor()
    elif platform.system() == 'Darwin':
        command = '/usr/sbin/sysctl -n machdep.cpu.brand_string'
        pltfrm = os.popen(command).read().strip()
    elif platform.system() == 'Linux':
        command = 'cat /proc/cpuinfo'
        pltfrm = os.popen(command).read().strip()
    else:
        pltfrm = None
    if pltfrm:
        date_now = datetime.datetime.strftime(datetime.datetime.now(), "%d%m%Y")
        serial = pltfrm + date_now
        pwd = serial.encode('utf-8')
        pwd = hashlib.md5(pwd).hexdigest()
        password = pwd[2:4] + pwd[7] + pwd[0] + pwd[3:5] + pwd[-3:-1]

        answer = {'method': 'getProcessor', 'answer': "ok", 'params': password}
    else:
        answer = {'method': 'getProcessor', 'answer': "error", 'params': {'message': "Not supported platform"}}
    return answer


def parse_method(rcv_data):
    global adc_check
    global pdo
    global flag_to_close
    answer = {}
    method = ""

    try:
        method = rcv_data.get('method')
        user_id = rcv_data.get('user')
        print(rcv_data)
        # SET.CARGO
        if method == "setCargo":
            name = rcv_data['params']['cargo']
            answer = json.dumps(sqlDriver.set_cargo(name))

        # GET.CARGOS
        elif method == "getCargos":
            answer = sqlDriver.get_cargos()

        # SET.CARGONAME
        elif method == "setCargoName":
            name = rcv_data['params']['cargoname']
            answer = json.dumps(sqlDriver.set_cargo_name(name))

        # GET.CARGONAMES
        elif method == "getCargoNames":
            answer = sqlDriver.get_cargonames()

        # SET.DEST.POINT
        elif method == "setDestPoint":
            name = rcv_data['params']['point']
            answer = json.dumps(sqlDriver.set_destination_point(name))

        # GET.DEST.POINTS
        elif method == "getDestPoints":
            answer = sqlDriver.get_destination_points()

        # START.WEIGHING
        elif method == "startWeighing":
            params = rcv_data.get('params')
            if 'chart' in params:
                chart = params['chart']
            else:
                chart = False
            try:
                if params['type'] == 'static.wagon':
                    weight_math.set_attributes(False, False, chart)
                    message = {"method": "startWeighing", "answer": 'ok', "params": {"message": 'Static wagon mode started'}}
                    answer = json.dumps(message)
                    log_data = {"source": 'user', "name": 'Static wagon mode started', "user": user_id}
                    sqlDriver.set_log(log_data)
                elif params['type'] == 'static.truck':
                    weight_math.set_attributes(True, False, chart)
                    message = {"method": "startWeighing", "answer": 'ok', "params": {"message": 'Static truck mode started'}}
                    answer = json.dumps(message)
                    log_data = {"source": 'user', "name": 'Static truck mode started', "user": user_id}
                    sqlDriver.set_log(log_data)
                else:
                    weight_math.set_attributes(False, True, chart)
                    recognition.clear_data()
                    message = {"method": "startWeighing", "answer": 'ok', "params": {"message": 'Dynamic mode started'}}
                    answer = json.dumps(message)
                    log_data = {"source": 'user', "name": 'Dynamic mode started', "user": user_id}
                    sqlDriver.set_log(log_data)
            except Exception as mes:
                sys_data = {"method": 'startWeighing', "exeption": mes.args}
                sqlDriver.set_system_log(sys_data)
                newAnswer = {"method": "startWeighing", "answer": 'error', "params": {"message": mes.args[0]}}
                answer = json.dumps(newAnswer)

        # GET.WEIGHT
        elif method == "getWeight":
            from weight_math import send_data
            if send_data:
                data = {"method": "getWeight", "answer": 'ok', "params": {"weight": float(send_data[2]), 1: float(send_data[0]),2: float(send_data[1]), "offset_lenghtwise": float(send_data[5]),"cross_offset": float(send_data[6]), "offset_lenghtwise_mm": float(send_data[4]), "cross_offset_mm": float(send_data[3]), "x": float(send_data[7]), "y": float(send_data[8])}}
            else:
                data = {"method": "getWeight", "answer": 'ok', "params": {"weight": 0, 1: 0, 2: 0,
                        "offset_lenghtwise": 0, "cross_offset": 0, "offset_lenghtwise_mm": 0, "cross_offset_mm": 0,
                        "x": 0, "y": 0}}
            answer = json.dumps(data)
            #print(answer)

        # SET.WEIGHT
        elif method == "addOperationData":
            data = rcv_data['params']
            reweight_flag = data['reweight']
            weight_type = data['type']
            answer = json.dumps(sqlDriver.addOperationData(data))
            if reweight_flag == 1:
                log_data = {"source": 'user', "name": 'Reweighting', "user": user_id,
                            "details": "Weight type: " + weight_type}
                sqlDriver.set_log(log_data)

        # UPDATE.WEIGHT
        elif method == "updateWeight":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.update_weight(data))

        # SET.WEIGHT !!!
        elif method == "setWeight":
            data = rcv_data['params']
            weight_type = data['type']
            row = data['row']
            brutto = row.get('brutto')
            start_weight = row.get('start_weight')
            if brutto:
                weight = brutto
            else:
                weight = start_weight
            answer = json.dumps(sqlDriver.addOperationData(data))
            log_data = {"source": 'user', "name": 'Weight was setted', "user": user_id, "details": "Weight type: " + weight_type + " Weight: " + str(weight)}
            sqlDriver.set_log(log_data)

        # REWEIGHT
        elif method == "reWeigh":
            data = rcv_data['params']
            weight_type = data['type']
            answer = json.dumps(sqlDriver.re_weight(data))
            log_data = {"source": 'user', "name": 'Weight was resetted', "user": user_id, "details": weight_type}
            sqlDriver.set_log(log_data)

        # DEL.WEIGHT
        elif method == "delWeight":
            data = rcv_data['params']
            weight_type = data['type']
            answer = json.dumps(sqlDriver.del_weight(data))
            log_data = {"source": 'user', "name": 'weight was deleted from operation table', "user": user_id, "details": weight_type}
            sqlDriver.set_log(log_data)

        # CHECK.VALIDATION
        elif method == "check.validation":
            data = rcv_data['params']
            pre_answer = sqlDriver.checkValidationData(data)
            answer = json.dumps(pre_answer)
            if pre_answer != None:
                if pre_answer['answer'] == 'ok':
                    user_name = pre_answer['params']['user_name']
                    log_data = {"source": 'system', "name": 'login', "user": "2", "details": user_name + " login"}
                else:
                    user_name = data['login']
                    error = pre_answer['params']
                    log_data = {"source": 'system', "name": 'login', "user": "2", "details": error + " for " + user_name}
                sqlDriver.set_log(log_data)

        # GET.ADC.STATUS
        elif method == "getADCstatus":
            pre_answer = weight_math.get_adc_status()
            camera_status = recognition.get_status()
            pre_answer['params'].update({"cameras": camera_status})
            answer = json.dumps(pre_answer)
            if pre_answer['answer'] == 'ok':
                if not pdo:
                    log_data = {"source": 'hardware', "name": 'PDO was connected', "user": "1"}
                    sqlDriver.set_log(log_data)
                else:
                    adcs = pre_answer['params']['data']
                    if len(adcs) > len(adc_check):
                        broken_adcs = ""
                        for i in adcs:
                            if i not in adc_check:
                                broken_adcs = broken_adcs + str(i) + " "
                        log_data = {"source": 'hardware', "name": 'ADC was disconnected', "user": "1",
                                    "details": "ADC number: " + broken_adcs}
                        sqlDriver.set_log(log_data)
                    adc_check = adcs
                pdo = True
            elif pre_answer['answer'] == 'warning' and pdo:
                pdo = False
                log_data = {"source": 'hardware', "name": 'PDO was disconnected', "user": "1"
                            }
                sqlDriver.set_log(log_data)

        # GET.LOGS
        elif method == "getLogs":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.get_logs(data, user_id))
            log_data = {"source": 'user', "name": 'Get all logs', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.ADC.DATA
        elif method == "getADCdata":
            from weight_math import ADC, ADCVAL
            pre_answer = {"method": 'getADCdata'}
            lp = []
            rp = []
            for i in range(4):
                lp.append({"id": i + 1, "raw": ADC[i], "offset": ADCVAL[i]})
            for i in range(4, 8):
                rp.append({"id": i + 1, "raw": ADC[i], "offset": ADCVAL[i]})
            pre_answer.update({"answer": 'ok', "params": {1: lp, 2: rp}})
            answer = json.dumps(pre_answer)

        # SET.HID.OPTIONS
        elif method == "setHidOptions":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_hid_options(data, int(user_id)))

        # GET.HID.OPTIONS
        elif method == "getHidOptions":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.get_hid_options(data, int(user_id)))

        # SET.ZERO
        elif method == "setZero":
            data = rcv_data['params']['truck']
            answer = json.dumps(weight_math.set_zero(data))
            log_data = {"source": 'user', "name": 'Zero was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.SETTINGS
        elif method == "getSettings":
            data = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.get_settings(data))

        # GET.GLOBALS
        elif method == "getGlobals":
            _answer = sqlDriver.get_globals()
            answer2 = sqlDriver.get_hardware_info()
            _answer['params']['typeOfScales'] = answer2['params']['weight_type']
            _answer['params']['siNumber'] = answer2['params']['nomersi']
            _answer['params']['accuracyType'] = answer2['params']['accuracy']
            _answer['params']['serialNumber'] = answer2['params']['weight_number']
            answer = json.dumps(_answer)

        # SET.SETTINGS
        elif method == "setSettings":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_settings(data))
            log_data = {"source": 'user', "name": 'User was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.USERS
        elif method == "getUsers":
            answer = json.dumps(sqlDriver.get_users(user_id))

        # SET.SERIAL
        elif method == "setSerial":
            data = rcv_data['params']
            cpu_inf = cpu_info()
            answer = json.dumps(sqlDriver.set_serial(data, cpu_inf['params']))
            log_data = {"source": 'user', "name": 'Serial number was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.OPERATION.TABLE
        elif method == "getOperationTable":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.get_operation_table(data))

        # GET.CALIBRATION.PARAMS
        elif method == "getCalibrationParams":
            pre_answer = {"method": 'getCalibrationParams'}
            from weight_math import BRW, BRH, BRB, INV, ADCCH, DISCR, DISCR1, DISCR_THRES
            try:
                adcData1 = []
                adcData2 = []
                for i in range(4):
                    adcData1.append({"id": i + 1, "number": ADCCH[i] + 1, "inversion": INV[i]})
                    adcData2.append({"id": i + 5, "number": ADCCH[i + 4] + 1, "inversion": INV[i + 4]})
                pre_answer.update({"answer": 'ok', "params": {"discrete": DISCR, "discrete2": DISCR1,
                                                              "discrete_threshold": DISCR_THRES, "BRH": BRH, "BRB": BRB,
                                                              "BRW": BRW, "adcData1": adcData1, "adcData2": adcData2}})
                answer = json.dumps(pre_answer)
            except Exception as mes:
                sys_data = {"method": 'getCalibrationParams', "exeption": str(mes.args)}
                sqlDriver.set_system_log(sys_data)
                pre_answer.update({"answer": 'error', "params": {"message": mes.args[0]}})
                answer = json.dumps(pre_answer)

        # SET.CALIBRATION.PARAMS
        elif method == "setCalibrationParams":
            data = rcv_data['params']
            answer = json.dumps(weight_math.set_platform_params(data))
            log_data = {"source": 'user', "name": 'Platform or ADCs params was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # SET.CALIBRATION.POINTS
        elif method == "setCalibrationPoints":
            data = rcv_data['params']
            answer = json.dumps(weight_math.set_calibration_points(data))
            log_data = {"source": 'user', "name": 'Calibration points was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.CALIBRATION.DATA
        elif method == "getCalibrationData":
            from weight_math import SUMLEFT, SUMRIGHT, WEIGHT, CTXMM, CTYMM, CTXRMM, CTYRMM, CTXLMM, CTYLMM, BRB, BRH, BRW
            data = {"method": 'getCalibrationData', "answer": 'ok', "params": {"weight": WEIGHT, "1": SUMLEFT, "2": SUMRIGHT,
                    "x": (float(CTXMM) * 2) / BRB, "y": (float(CTYMM) * 2) / BRW,
                    "x1": (float(CTXLMM) * 2) / BRH, "y1": (float(CTYLMM) * 2) / BRW,
                    "x2": (float(CTXRMM) * 2 / BRH), "y2": (float(CTYRMM) * 2) / BRW}}
            answer = json.dumps(data)

        # GET.CALIBRATION.POINTS
        elif method == "getCalibrationPoints":
            pre_answer = {"method": 'getCalibrationPoints'}
            try:
                points = sqlDriver.get_cal_points()
                good_points_left = []
                good_points_right = []    # {1:[{id: 123, weight: 123}], 2: [{}]}
                lp = points['1']
                rp = points['2']
                for i in range(10):
                    if lp[i] != 0:
                        good_points_left.append({"id": i + 1, "weight": lp[i], "save": 1})
                    if rp[i] != 0:
                        good_points_right.append({"id": i + 1, "weight": rp[i], "save": 1})
                pre_answer.update({"answer": 'ok', "params": {1: good_points_left, 2: good_points_right}})
                answer = json.dumps(pre_answer)
            except Exception as mes:
                sys_data = {"method": 'getCalibrationPoints', "exeption": str(mes.args)}
                sqlDriver.set_system_log(sys_data)
                pre_answer.update({"answer": 'error', "params": {"message": mes.args[0]}})
                answer = json.dumps(pre_answer)

        # DEL.CALIBRATION.POINTS
        elif method == "delCalibrationPoints":
            data = rcv_data['params']
            answer = json.dumps(weight_math.delete_calibration_points(data))
            log_data = {"source": 'user', "name": 'Calibration points was deleted', "user": user_id}
            sqlDriver.set_log(log_data)

        # SET.ARCHIVE
        elif method == "setArchive":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_archive(data))
            log_data = {"source": 'user', "name": 'Operation data was saved in archive', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.ARCHIVE
        elif method == "getArchive":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.get_archive(data))
            log_data = {"source": 'user', "name": 'Archive was shown', "user": user_id}
            sqlDriver.set_log(log_data)

        # SET.REPORT
        elif method == "setReport":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_report(data))
            log_data = {"source": 'user', "name": 'Report was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.REPORT
        elif method == "getReport":
            report_id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.get_report(report_id))

        # GET.REPORTS
        elif method == "getReports":
            answer = json.dumps(sqlDriver.get_reports())
            log_data = {"source": 'user', "name": 'All reports was shown', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.ACTIVE.REPORTS
        elif method == "getActiveReports":
            answer = sqlDriver.get_active_reports()
            log_data = {"source": 'user', "name": 'All reports was shown', "user": user_id}
            sqlDriver.set_log(log_data)

        # DEL.REPORT
        elif method == "delReport":
            report_id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.del_report(report_id))
            log_data = {"source": 'user', "name": 'Report was deleted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.COMPORTS
        elif method == "getCOMPorts":
            pre_answer = serial_comports.serial_ports()
            answer = json.dumps({"method": "getCOMPorts", "answer": 'ok', "params": {"ports": pre_answer}})

        # SWITCH.REPORT
        elif method == "switchReport":
            data = rcv_data['params']
            rep_id = data['id']
            answer = json.dumps(sqlDriver.switch_report(data))
            log_data = {"source": 'user', "name": 'Report was switched', "user": user_id, "details": "Report id: " + str(rep_id)}
            sqlDriver.set_log(log_data)

        # DEL.USER
        elif method == "delUser":
            userid = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.delete_user(userid))
            log_data = {"source": 'user', "name": 'User was deleted', "user": user_id, "details": "User id: " + str(userid)}
            sqlDriver.set_log(log_data)

        # SET.CONFIGURATION
        elif method == "setConfigurationDynamic":
            data = rcv_data['params']
            answer = json.dumps(weight_math.set_configuration_dynamic(data))
            log_data = {"source": 'user', "name": 'Dynamic configuration was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.CONFIGURATION.DYNAMIC
        elif method == "getConfigurationDynamic":
            from weight_math import W_THRES, CALMTIME, L_PLAT, Z_LEVEL
            answer = json.dumps({"method": "getConfigurationDynamic", "answer": 'ok', "params": {"platform": L_PLAT,
                                 "speedthreshold": W_THRES, "zerothreshold": Z_LEVEL, "calming": CALMTIME}})

        #SET.CONFIGURATION
        elif method == "setConfiguration":
            data = rcv_data['params']
            answer = json.dumps(weight_math.set_configuration(data))
            log_data = {"source": 'user', "name": 'Configuration was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        #GET.CONFIGURATION
        elif method == "getConfiguration":
            from weight_math import WMAX, COMPTT, SPEEDT, TABLUSE, GOST, CTMAXX, CTMAXY, WTHR, PERIOD, right_platform, TEL
            answer = json.dumps({"method": "getConfiguration", "answer": 'ok', "params": {"maximum_weight_at_zeroing": WMAX,
                                "display_com_port": COMPTT, "display_baud_rate": SPEEDT, "display_turned": TABLUSE,
                                "gost": GOST, "longitudinal": CTMAXX, "transverse": CTMAXY, "threshold": WTHR, "period": PERIOD,
                                "platform_for_dynamic": right_platform, "wagon_weighing": TEL}})

        #SET.HARDWARE
        elif method == "setHardware":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_hardware(data))
            log_data = {"source": 'user', "name": 'Hardware was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        #GET.HARDWARE
        elif method == "getHardware":
            answer = json.dumps(sqlDriver.get_hardware())

        #SET.CALIBRATION.DYNAMIC
        elif method == "setCalibrationDynamic":
            data = rcv_data['params']
            answer = json.dumps(weight_math.auto_cal_dyn(data))
            log_data = {"source": 'user', "name": 'Dynamic calibration was started', "user": user_id}
            sqlDriver.set_log(log_data)

        #GET.CALIBRATION.DYNAMIC
        elif method == "getCalibrationDynamic":
            answer = {"method": "getCalibrationDynamic"}
            try:
                data = []
                from weight_math import autocal_data, dyn_speed, status, AXES

                if autocal_data:
                    avrg_percent = autocal_data['avrg_percent']
                    avrg_coof = autocal_data['avrg_coof']
                    coofs = autocal_data['coof']
                    percents = autocal_data['percent_weight']
                    coof_weights = autocal_data['coof_weight']

                    for i in range(len(coofs)):
                        data.append({'id': i + 1, 'koef': coofs[i], 'weightKG': coof_weights[i], 'percent_weight': percents[i]})

                    answer.update({"answer": 'ok', "params": {"status": status, "axels_count": AXES, 'avrg_coof': avrg_coof, 'avrg_percent': avrg_percent,
                                                              'speed': dyn_speed, 'data': data}})
                    weight_math.zeroing_autocal_data()
                else:

                    answer.update({"answer": 'ok',
                                   "params": {"status": status, "axels_count": AXES, 'avrg_coof': 0, 'avrg_percent': 0, 'speed': dyn_speed,
                                              'data': "None"}})
                answer = json.dumps(answer)
            except Exception as inst:
                sys_data = {"method": 'getCalibrationDynamic', "exeption": str(inst.args)}
                sqlDriver.set_system_log(sys_data)
                answer.update({'answer': "error", "params": {"message": inst.args}})
                answer = json.dumps(answer)

        # GET.WEIGHT.DYNAMIC
        elif method == "getWeightDynamic":
            user = rcv_data['params']['user']
            flag = rcv_data['params']['write']
            answer = {"method": "getWeightDynamic"}
            try:
                from weight_math import dyn_data, dyn_speed, status, AXES
                if dyn_data:
                    for row in dyn_data:
                        row["user"] = user
                        row["type"] = "dynamic"
                        data = {"type": "dynamic", "row": row.copy()}
                        #if flag:
                        #    sqlDriver.addOperationData(data)
                    answer.update({"answer": 'ok', "params": {"status": status, "axels_count": AXES, "speed": 0, "data": dyn_data}})
                    log_data = {"source": 'user', "name": 'Dynamic weighting was finished', "user": user_id}
                    sqlDriver.set_log(log_data)
                    weight_math.zeroing_dyn_data()
                else:
                    answer.update({"answer": 'ok', "params": {"status": status, "axels_count": AXES, "speed": dyn_speed, "data": "None"}})
                answer = json.dumps(answer)
            except Exception as inst:
                sys_data = {"method": 'getWeightDynamic', "exeption": str(inst.args)}
                sqlDriver.set_system_log(sys_data)
                answer.update({'answer': "error", "params": {"message": inst.args[0]}})
                answer = json.dumps(answer)

        # GET.CHARTS
        elif method == "getCharts":
            answer = {"method": "getCharts"}
            try:
                #from weight_math import chart1, chart2, chart3
                chart1, chart2, chart3 = weight_math.return_charts()
                answer.update({"answer": 'ok', "params": {"chart1": chart1, "chart2": chart2, "chart3": chart3}})

                answer = json.dumps(answer)
            except Exception as inst:
                sys_data = {"method": 'getCharts', "exeption": str(inst.args)}
                sqlDriver.set_system_log(sys_data)
                answer.update({'answer': "error", "params": {"message": inst.args[0]}})
                answer = json.dumps(answer)

        # GET.CONTRACTORS
        elif method == "getContractors":
            answer = json.dumps(sqlDriver.get_contractors())

        # SET.CONTRACTOR
        elif method == "setContractor":
            contractor = rcv_data['params']
            answer = json.dumps(sqlDriver.set_contractor(contractor))
            log_data = {"source": 'user', "name": 'Contractor was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # SET.PROTOCOL
        elif method == "setProtocol":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_protocol(data))
            log_data = {"source": 'user', "name": 'Protocol was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.PROTOCOLS
        elif method == "getProtocols":
            answer = json.dumps(sqlDriver.get_protocols())
            log_data = {"source": 'user', "name": 'All protocols was shown', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.PROTOCOL
        elif method == "getProtocol":
            id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.get_protocol(id))

        # DEL.PROTOCOL
        elif method == "delProtocol":
            id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.del_protocol(id))
            log_data = {"source": 'user', "name": 'Protocol was deleted', "user": user_id, "details": "Protocol id: " + str(id)}
            sqlDriver.set_log(log_data)

        # SWITCH.PROTOCOL
        elif method == "switchProtocol":
            data = rcv_data['params']
            prot_id = data['id']
            answer = json.dumps(sqlDriver.switch_protocol(data))
            log_data = {"source": 'user', "name": 'Protocol was switched', "user": user_id,
                        "details": "Protocol id: " + str(prot_id)}
            sqlDriver.set_log(log_data)

        # SET.CAMERA
        elif method == "setCamera":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_camera(data))
            recognition.set_mode("changed")
            log_data = {"source": 'user', "name": 'Camera was setted', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.CAMERAS
        elif method == "getCameras":
            answer = json.dumps(sqlDriver.get_cameras())

        # DEL.CAMERA
        elif method == "delCamera":
            camera_id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.del_camera(camera_id))
            recognition.set_mode("changed")
            log_data = {"source": 'user', "name": 'Camera was deleted', "user": user_id, "details": "Camera id: " + str(camera_id)}
            sqlDriver.set_log(log_data)

        # GET.CAMERA
        elif method == "getCamera":
            camera_id = rcv_data['params']['id']
            answer = json.dumps(sqlDriver.get_camera(camera_id))

        # GET.LAST.VERIFICATION
        elif method == "getLastVerification":
            answer = json.dumps(sqlDriver.get_last_verification())

        # SET.LAST.VERIFICATION
        elif method == "setLastVerification":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_last_verification(data))

        # SET.VERIFICATION.DYNAMIC
        elif method == "setVerificationDynamic":
            data = rcv_data['params']
            answer = json.dumps(weight_math.dyn_pov(data))
            log_data = {"source": 'user', "name": 'Dynamic verification was started', "user": user_id}
            sqlDriver.set_log(log_data)

        # GET.VERIFICATION.DYNAMIC
        elif method == "getVerificationDynamic":
            answer = {"method": "getVerificationDynamic"}
            try:
                from weight_math import pov_data, dyn_speed, status

                if pov_data:

                    answer.update({"answer": 'ok', "params": {"status": status, 'speed': dyn_speed, 'data': pov_data}})
                    weight_math.zeroing_pov_data()
                else:

                    answer.update({"answer": 'ok', "params": {"status": status, 'speed': dyn_speed, 'data': "None"}})
                answer = json.dumps(answer)
            except Exception as inst:
                sys_data = {"method": "getVerificationDynamic", "exeption": str(inst.args)}
                sqlDriver.set_system_log(sys_data)
                answer.update({'answer': "error", "params": {"message": inst.args}})
                answer = json.dumps(answer)

        #
        elif method == "saveArchive":
            file_name = rcv_data['params']['name']
            answer = json.dumps(sqlDriver.save_data(file_name, method))

        #
        elif method == "saveCalibration":
            file_name = rcv_data['params']['name']
            answer = json.dumps(sqlDriver.save_data(file_name, method))

        #
        elif method == "saveLogs":
            file_name = rcv_data['params']['name']
            answer = json.dumps(sqlDriver.save_data(file_name, method))

        #
        elif method == "saveBackup":
            file_name = rcv_data['params']['name']
            answer = json.dumps(sqlDriver.save_data(file_name, method))

        #
        elif method == "setOrganizationName":
            name = rcv_data['params']['organizationName']
            answer = json.dumps(sqlDriver.set_organization_name(name))

        #
        elif method == "setVerificationArchive":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.set_verification_archive(data))

        #
        elif method == "getVerificationArchive":
            data = rcv_data['params']
            answer = json.dumps(sqlDriver.get_verification_archive(data))

        #
        elif method == "test":
            answer = json.dumps(sqlDriver.test())

        #
        elif method == "setKleimo":
            data = rcv_data['params'][0]
            answer = json.dumps(sqlDriver.set_kleimo(data))

        #
        elif method == "getKleimo":
            answer = json.dumps(sqlDriver.get_kleimo())

        #
        elif method == "logout":
            log_data = {"source": 'user', "name": 'User logout', "user": user_id}
            sqlDriver.set_log(log_data)
            answer = json.dumps({'answer': 'ok', "params": {'message': 'User logout.'}})

        #
        elif method == "setHardwareInfo":
            data = rcv_data['params']
            log_data = {"source": 'user', "name": 'Changed hardware info', "user": user_id}
            pre_answer = sqlDriver.set_hardware_info(data)
            sqlDriver.set_log(log_data)
            answer = json.dumps(pre_answer)

        # SET.PHOTO
        elif method == "setPhoto":
            data = rcv_data['params']
            pre_answer = recognition.set_data(data)
            answer = json.dumps(pre_answer)

        # GET.PHOTO
        elif method == "getPhoto":
            data = rcv_data['params']
            pre_answer = {"method": method}
            _data = recognition.get_data(len(data))
            pre_answer['answer'] = _data['answer']
            pre_answer['params'] = _data['params']
            answer = json.dumps(pre_answer)

        # SET.CAMERA.STATUS
        elif method == "setCameraStatus":
            data = rcv_data['params']
            pre_answer = recognition.set_status(data)
            pre_answer['method'] = "setCameraStatus"
            pre_answer['answer'] = "ok"
            answer = json.dumps(pre_answer)

        #
        elif method == "getHardwareInfo":
            pre_answer = sqlDriver.get_hardware_info()
            answer = json.dumps({'method': method, 'answer': 'ok', "params": pre_answer})

        # CLOSE
        elif method == "close":
            #weight_math.SAVETUNE()
            log_data = {"source": 'user', "name": 'Programm was closed', "user": user_id}
            sqlDriver.set_log(log_data)
            answer = json.dumps({'answer': 'ok', "params": {'message': 'Program is closing'}})
            flag_to_close = True

        elif method == "getProcessor":
            cpu_inf = cpu_info()
            answer = json.dumps(cpu_inf)
        # UNSUPPORTED COMMAND !!!!
        else:
            newAnswer = {'answer': 'error', "params": {'message': 'Currently unsupported command.'}}
            answer = json.dumps(newAnswer)
            log_data = {"source": 'user', "name": 'UNSUPPORTED COMMAND', "user": user_id, "details": str(rcv_data)}
            sqlDriver.set_log(log_data)

    except Exception as inst:
        sys_data = {"method": "parsemethod: " + method, "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({'answer': "error", "params": {"message": inst.args}})
        answer = json.dumps(answer)

    return answer
