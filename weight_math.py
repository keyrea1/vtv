import math
import sqlDriver
import _thread
import serial_comports
import buffer
import time
import datetime
from recognition import clear_data
import axisdetector

labels = [0 for a in range(1400)]

GRGO = False
STEPS = [[0 for b in range(5)] for c in range(3000)]
SUMWFAR = 0
SUMWNEA = 0
NFIL = 0
INDX = 0
AXES = 0
WEIGHT_SPEED = 0
WEIGHT_SPEED_OLD = 0

WMAX = 100000       # KG MAX ?
WEIGHT = 0          # KG VES CHAS
CURRWAG = 0     #WAGON?
ADC = []
ADCCH = [0] * 8
OFFSET = [0] * 8

FKOE = 128
FMASS = [[0 for d in range(8)] for e in range(FKOE)]# ???
FINDX = [0] * 8           # ????
FSUMM = [0] * 8   # ????

PROGSTAT = 0
STATUS = 0          # ????
DATSTAT = [0] * 8 # ????
INV = [False] * 8       # ????
ADCVAL = [0] * 8

DYN = False
OVL = True

WDAT = [0] * 8
TEL = True
CAL_TABLE = [[[0 for f in range(3)] for g in range(10)] for h in range(8)]

WMASS = [['' for i in range(13)] for j in range(36)]
WPAGE = 0

SUMLEFT = 0 # weight of left platf in tons
SUMRIGHT = 0 # weight of right platf in tons

BRH = 0
BRW = 0
BRB = 0

CTXLMM = 0
CTYLMM = 0
CTXRMM = 0
CTYRMM = 0
CTXMM = 0
CTYMM = 0

WTHR = 0
ADCVALSUM = [0] * 8
CTZERO = 0
STARTTIME = 0
SUMLEFT_OLD = 0
WDIR = 0
SOSTPASS = False
NCALM = 0
SOST_STARTTIME = 0
UP_INDX = 0
DWN_INDX = 0
UPS = [0.0] * 5000
DWNS = [0.0] * 5000
TIMEOUT = 40
TEPL_FIRST = False
DISCR = 10
DISCR1 = 10
DISCR_THRES = 10
DYNPOV = False
AUTOCAL = False
KKORR = 1
KKORR_TEMP = 0
IZMW_DYN = [""] * 8
REALW_DYN = [""] * 8
POVSPD = [""] * 8
POGKG_DYN = [""] * 8
POGPS_DYN = [""] * 8
mas = [[0 for k in range(13)] for l in range(12)]
COMPT = ""
SPEEDT = 0
SPEED = 0
CURRSOST = 1
TS0 = 0
TS3 = 0
send_data = []
autocal_data = {}
dyn_speed = 0
dyn_data = []
pov_data = []
chart1 = []
chart2 = []
chart3 = []
status = False
write_status = True
W_THRES = 0
CALMTIME = 0
Z_LEVEL = 0
L_PLAT = 0
COMPTT = ''
TABLUSE = False
GOST = False
CTMAXX = 0
CTMAXY = 0
PERIOD = 0
right_platform = False
direction = False

def STARTDEF():    # nulify

    global STEPS
    global SUMWFAR
    global SUMWNEA
    global NFIL
    global INDX
    global AXES
    global WEIGHT_SPEED
    global WEIGHT_SPEED_OLD
    for i in range(3000):
        for j in range(5):
            STEPS[i][j] = 0
    SUMWFAR = 0
    SUMWNEA = 0
    NFIL = 0
    INDX = 0
    AXES = 0
    WEIGHT_SPEED = 0
    WEIGHT_SPEED_OLD = 0


def COLLECT():
    global TYPVES
    global NPV
    global DISCR
    global DISCR1
    global DISCR_THRES
    global NOMSI
    global PREC
    global PONAME
    global POID
    global POVER
    global POMD5
    global ORGANIZ
    global NOMVES
    global TELWAG
    global CTMAXX
    global CTMAXY
    global WMAX
    global WTHR
    global PERIOD
    global TABLUSE
    global GOST
    global LASTPOV
    global GOSPOV
    global PREDPRED
    global PREDZVO
    global COMPTT
    global SPEEDT
    global DYN
    global KKORR
    global W_THRES
    global Z_LEVEL
    global CALMTIME
    global L_PLAT
    global INV
    global ADCCH
    global OFFSET
    global CAL_TABLE
    global TEL
    global COMPT
    global SPEED
    global BRW
    global BRH
    global BRB
    global PROGSTAT
    global CURRSOST
    global CURRWAG
    global WPAGE
    global right_platform
    global update_speed

    settings = sqlDriver.get_adc_settings()

    for i in range(8):
        INV[i] = settings[i][0]
        ADCCH[i] = settings[i][1]
        OFFSET[i] = settings[i][2]

    CAL_TABLE = sqlDriver.get_cal_tables()

    data = sqlDriver.strange_table()
    TYPVES = data[1]
    NPV = data[2]
    DISCR = data[3]
    NOMSI = data[4]
    PREC = data[5]
    PONAME = data[6]
    POID = data[7]
    POVER = data[8]
    POMD5 = data[9]
    ORGANIZ = data[10]
    NOMVES = data[11]
    TEL = data[12]
    CTMAXX = data[13]
    CTMAXY = data[14]
    WMAX = data[15]
    WTHR = data[16]
    PERIOD = data[17]
    TABLUSE = data[18]
    GOST = data[19]
    LASTPOV = data[20]
    GOSPOV = data[21]
    PREDPRED = data[22]
    PREDZVO = data[23]
    COMPTT = data[24] # tablo port
    SPEEDT = data[25] # tablo baud rate
    DYN = data[26]
    KKORR = float(data[27])
    W_THRES = data[28]
    Z_LEVEL = data[29]
    CALMTIME = data[30]
    L_PLAT = data[31]
    COMPT = data[32]
    SPEED = data[33]
    BRW = data[34]
    BRH = data[35]
    BRB = data[36]
    PROGSTAT = data[37]
    CURRSOST = data[38]
    CURRWAG = data[39]
    DISCR1 = data[40]
    DISCR_THRES = data[41]
    right_platform = data[42]


def SAVETUNE():

    global TYPVES
    global NPV
    global DISCR
    global DISCR1
    global DISCR_THRES
    global NOMSI
    global PREC
    global PONAME
    global POID
    global POVER
    global POMD5
    global ORGANIZ
    global NOMVES
    global TELWAG
    global CTMAXX
    global CTMAXY
    global WMAX
    global WTHR
    global PERIOD
    global TABLUSE
    global GOST
    global LASTPOV
    global GOSPOV
    global PREDPRED
    global PREDZVO
    global COMPTT
    global SPEEDT
    global DYN
    global KKORR
    global W_THRES
    global Z_LEVEL
    global CALMTIME
    global L_PLAT
    global INV
    global ADCCH
    global OFFSET
    global CAL_TABLE
    global TEL
    global COMPT
    global SPEED
    global BRW
    global BRH
    global BRB
    global PROGSTAT
    global CURRSOST
    global CURRWAG
    global WPAGE

    sqlDriver.save_adc_settings(INV, ADCCH, OFFSET)
    sqlDriver.save_cal_tables(CAL_TABLE)

    data1 = {'TYPVES': TYPVES, 'NPV': NPV, 'DISCR': DISCR, 'DISCR1': DISCR1, 'DISCR_THRES': DISCR_THRES, 'NOMSI': NOMSI, 'PREC': PREC,
            'PONAME': PONAME, 'POID': POID, 'POVER': POVER, 'POMD5': POMD5, 'ORGANIZ': ORGANIZ,
            'NOMVES': NOMVES, 'TELWAG': TELWAG, 'CTMAXX': CTMAXX, 'CTMAXY': CTMAXY,
            'WMAX': WMAX, 'WTHR': WTHR, 'PERIOD': PERIOD, 'TABLUSE': TABLUSE, 'GOST': GOST,
            'LASTPOV': LASTPOV, 'GOSPOV': GOSPOV, 'PREDPRED': PREDPRED, 'PREDZVO': PREDZVO,
            'COMPTT': COMPTT, 'SPEEDT': SPEEDT, 'DYN': DYN, 'KKORR': str(KKORR), 'W_THRES': W_THRES,
            'Z_LEVEL': Z_LEVEL, 'CALMTIME': CALMTIME, 'L_PLAT': L_PLAT, 'COMPT': COMPT,
            'SPEED': SPEED, 'BRW': BRW, 'BRH': BRH, 'BRB': BRB, 'PROGSTAT': PROGSTAT,
            'CURRSOST': CURRSOST, 'CURRWAG': CURRWAG}

    sqlDriver.save_strange_table(data1)


def DecimalPart(nbr):
    wholePart = math.trunc(nbr)
    fractionalPart = nbr - wholePart
    return fractionalPart


def LIMITX(net):
    LIMTABX = [[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 62, 67, 70, 80],
               [3000, 2480, 2160, 1730, 1440, 1235, 1080, 960, 865, 785, 720, 630, 260, 60, 0]]
    if net <= LIMTABX[0][0]:
        return LIMTABX[1][0]
    if net >= LIMTABX[0][13]:
        return LIMTABX[1][14]

    a = 0
    b = 0
    c = 0
    d = 0
    for i in range(1, 14):
        if net < LIMTABX[0][i]:
            a = LIMTABX[1][i]
            b = LIMTABX[1][i - 1]
            c = LIMTABX[0][i]
            d = LIMTABX[0][i - 1]
    return ((net - d) * ((a - b) / (c - d))) + b


def LIMITY(net):
    LIMTABY = [[10, 30, 50, 55, 67, 70], [410, 350, 250, 170, 140, 100]]
    if net <= LIMTABY[0][0]:
        return LIMTABY[1][0]
    if net >= LIMTABY[0][4]:
        return LIMTABY[1][5]

    a = 0
    b = 0
    c = 0
    d = 0
    for i in range(1, 5):
        if net < LIMTABY[0][i]:
            a = LIMTABY[1][i]
            b = LIMTABY[1][i - 1]
            c = LIMTABY[0][i]
            d = LIMTABY[0][i - 1]
    return ((net - d) * ((a - b) / (c - d))) + b


def FILT(VAL, NOM):
    global FKOE
    global FMASS
    global FINDX
    global FSUMM
    FMASS[FINDX[NOM]][NOM] = VAL
    FSUMM[NOM] = 0
    for i in range(FKOE):
        FSUMM[NOM] += FMASS[i][NOM]
    FINDX[NOM] += 1
    if FINDX[NOM] >= FKOE:
        FINDX[NOM] = 0
    return int(round(FSUMM[NOM] / FKOE))


def Timer2_Tick():
    global GRGO
    global ADC
    global STATUS
    global DATSTAT
    global WEIGHT
    global WMASS
    global SUMRIGHT
    global SUMLEFT
    global PROGSTAT
    global OVL
    global BRH
    global BRW
    global BRB
    global CTXLMM
    global CTYLMM
    global CTXRMM
    global CTYRMM
    global WTHR
    global ADCVALSUM
    global CTZERO
    global STARTTIME
    global TS0
    global TS1
    global TS3
    global SUMLEFT_OLD
    global WEIGHT_SPEED_OLD
    global W_THRES
    global Z_LEVEL
    global CALMTIME
    global L_PLAT
    global CTXLT
    global CTYLT
    global CTXRT
    global CTYRT
    global CTXT
    global CTYT
    global WDIR
    global SOSTPASS
    global AXES
    global NCALM
    global NFIL
    global SUMWFAR
    global SUMWNEA
    global INDX
    global SOST_STARTTIME
    global UP_INDX
    global DWN_INDX
    global UPS
    global DWNS
    global TIMEOUT
    global INV
    global DISCR
    global DISCR1
    global DISCR_THRES
    global ADCCH
    global STARTTIME
    global WEIGHT_SPEED
    global WEIGHT_SPEED_OLD
    global send_data
    global CTXMM
    global CTYMM
    global dyn_speed
    global chart1
    global chart2
    global chart3
    global status
    global write_status
    global right_platform
    global direction
    global STEPS
    global axis
    lasts = [[0 for f in range(4)] for g in range(49)]
    flag_of_start = False
    flag_for_speed = False
    weight_for_flag = 300
    some_iter = 0
    _some_iter = 0

    vals = None
    grgo_timer = 0
    grgo_start = round(time.time(), 2) * 1000
    #f = open('adcs1.txt', 'w')
    try:
        LINK = False
        while True:

            if vals:

                for i in vals:
                    ADC = i
                    #f.write(str(ADC) + '\n')
                    if LINK:

                        STATUS = ADC[8]
                        for i in range(8):
                            if (STATUS == math.pow(4, i) * 3) or ADC[ADCCH[i]] > 64500 or ADC[ADCCH[i]] == 0:
                                DATSTAT[i] = True
                                ADC[ADCCH[i]] = OFFSET[ADCCH[i]]
                            else:
                                DATSTAT[i] = False

                    else:
                        for i in range(8):
                            ADC[ADCCH[i]] = OFFSET[ADCCH[i]]
                        STATUS = 65535

                    for i in range(8):
                        if INV[i] == False:
                            ADCVAL[ADCCH[i]] = ADC[ADCCH[i]] - OFFSET[ADCCH[i]]
                        else:
                            ADCVAL[ADCCH[i]] = OFFSET[ADCCH[i]] - ADC[ADCCH[i]]

                    adcval = ADCVAL.copy()

                    if not DYN:
                        # /////////FILTR////////////
                        some = ADCVAL.copy()
                        for i in range(8):
                            ADCVAL[i] = int(FILT(some[i], i))



                    # ///////////////////////////STATIC//////////////////////////////////////////
                        if TEL:
                            if right_platform:
                                for i in [4, 5, 6, 7]:
                                    WDAT[i - 4] = (CALCAL(OFFSET[ADCCH[i]], ADCVAL[i], i))
                            else:
                                for i in [0, 1, 2, 3]:
                                    WDAT[i] = (CALCAL(OFFSET[ADCCH[i]], ADCVAL[i], i))

                        else:
                            for i in range(8):

                                WDAT[i] = (CALCAL(OFFSET[ADCCH[i]], ADCVAL[i], i))

                        SUMLEFT = WDAT[0] + WDAT[1] + WDAT[2] + WDAT[3]  # left teleg    kg
                        SUMRIGHT = WDAT[4] + WDAT[5] + WDAT[6] + WDAT[7]    # right teleg   kg
                        WEIGHT = SUMLEFT + SUMRIGHT     # TOTAL WEIGHT. kg

                        if ((WMASS[CURRWAG][2] != '' and
                                WMASS[CURRWAG][3] != '' and
                                WMASS[CURRWAG][4] != '' and
                                WMASS[CURRWAG][5] != '' and
                                WMASS[CURRWAG][6] != '' and
                                WMASS[CURRWAG][7] != '') and
                                (PROGSTAT == 2 or PROGSTAT == 3)):
                            if (WMASS[CURRWAG][4] >= WMASS[CURRWAG][5]):
                                OVL = True
                                # send_message("перегруз")
                            else:
                                OVL = False
                                TP = 0
                                if (WMASS[CURRWAG][4] != ''):
                                    TP = WMASS[CURRWAG][4]
                                    if TP < 0:
                                        TP = 0
                                    data2 = round((TP / WMASS[CURRWAG][5]) * 100) # ??? - передавать Кириллу
                                    #send_message(data2) # Процент от максимального веса или типо того
                        else:
                            OVL = False
                        if SUMLEFT > 50:
                            CTXLMM = (((WDAT[1] + WDAT[3]) / SUMLEFT) * BRH) - BRH / 2
                            if CTXLMM > BRH / 2: CTXLMM = BRH / 2
                            if CTXLMM < -BRH / 2: CTXLMM = -BRH / 2
                            CTYLMM = (((WDAT[0] + WDAT[1]) / SUMLEFT) * BRW) - BRW / 2
                            if CTYLMM > BRW: CTYLMM = BRW
                        else:
                            CTXLMM = 0
                            CTYLMM = 0
                        if SUMRIGHT > 50:
                            CTXRMM = (((WDAT[5] + WDAT[7]) / SUMRIGHT) * BRH) - BRH / 2
                            if CTXRMM > BRH / 2: CTXRMM = BRH / 2
                            if CTXRMM < -BRH / 2: CTXRMM = -BRH / 2
                            CTYRMM = (((WDAT[4] + WDAT[5]) / SUMRIGHT) * BRW) - BRW / 2
                            if CTYRMM > BRW: CTYRMM = BRW
                        else:
                            CTXRMM = 0
                            CTYRMM = 0
                        if WEIGHT > 50:
                            CTXMM = ((SUMRIGHT / WEIGHT) * BRB) - BRB / 2
                            if CTXMM > BRB / 2: CTXMM = BRB / 2
                            if CTXMM < -BRB / 2: CTXMM = -BRB / 2
                        else:
                            CTXMM = 0

                        CTYMM = (CTYRMM + CTYLMM) / 2
                        CTXLT = (WDAT[1] + WDAT[3]) - (WDAT[0] + WDAT[2])
                        CTYLT = (WDAT[1] + WDAT[0]) - (WDAT[2] + WDAT[3])
                        CTXRT = (WDAT[5] + WDAT[7]) - (WDAT[4] + WDAT[6])
                        CTYRT = (WDAT[4] + WDAT[5]) - (WDAT[6] + WDAT[7])
                        CTXT = SUMRIGHT - SUMLEFT
                        CTYT = (CTYLT + CTYRT) / 2

                        #//////////////////auto 0//////////////////////////////
                        if WTHR > 0:
                            if WEIGHT < WTHR:
                                for I in range(8):
                                    ADCVALSUM[ADCCH[I]] += adcval[ADCCH[I]]
                                CTZERO += 1
                                if CTZERO >= (PERIOD * 5):
                                    for I in range(8):
                                        ADCVALSUM[ADCCH[I]] = int(ADCVALSUM[ADCCH[I]] / CTZERO)
                                        if INV[I] == False:
                                            OFFSET[ADCCH[I]] += ADCVALSUM[ADCCH[I]]
                                        else:
                                            OFFSET[ADCCH[I]] -= ADCVALSUM[ADCCH[I]]

                                    ADCVALSUM = [0] * 8
                                    CTZERO = 0
                            else:
                                if CTZERO != 0:
                                    for I in range(8):
                                        ADCVALSUM[ADCCH[I]] = int(ADCVALSUM[ADCCH[I]] / CTZERO)
                                        if INV[I] == False:
                                            OFFSET[ADCCH[I]] += ADCVALSUM[ADCCH[I]]
                                        else:
                                            OFFSET[ADCCH[I]] -= ADCVALSUM[ADCCH[I]]
                                    ADCVALSUM = [0] * 8
                                    CTZERO = 0

                        # ////////////////////////////////////////////////
                        if WEIGHT >= int(DISCR_THRES):
                            discr = DISCR1
                        else:
                            discr = DISCR
                        if SUMLEFT % discr >= discr / 2:
                            SUMLEFT = (SUMLEFT // discr) * discr + discr
                        else:
                            SUMLEFT = (SUMLEFT // discr) * discr
                        if SUMRIGHT % discr >= discr / 2:
                            SUMRIGHT = (SUMRIGHT // discr) * discr + discr
                        else:
                            SUMRIGHT = (SUMRIGHT // discr) * discr
                        if WEIGHT % discr >= discr / 2:
                            WEIGHT = (WEIGHT // discr) * discr + discr
                        else:
                            WEIGHT = (WEIGHT // discr) * discr



                        # /////////////////////////////////////////////////
                        SUMLEFT = str(SUMLEFT)
                        SUMRIGHT = str(SUMRIGHT)
                        WEIGHT = str(WEIGHT)

                        CTYMM = '{:.2f}'.format(CTYMM)
                        CTXMM = '{:.2f}'.format(CTXMM)
                        CTYRMM = '{:.2f}'.format(CTYRMM)
                        CTXRMM = '{:.2f}'.format(CTXRMM)
                        CTYLMM = '{:.2f}'.format(CTYLMM)
                        CTXLMM = '{:.2f}'.format(CTXLMM)

                        CTXLT = str(CTXLT)
                        CTYLT = str(CTYLT)
                        CTXRT = str(CTXRT)
                        CTYRT = str(CTYRT)
                        CTXT = str(int(CTXT))
                        CTYT = str(int(CTYT))
                        send_data = [SUMLEFT, SUMRIGHT, WEIGHT, CTYMM, CTXMM, CTXT, CTYT, float(CTXMM) * 2 / BRB, float(CTYMM) * 2 / BRH]
                        #print(send_data)
                        # /////////////////////////////////////////////////
                    else:
                        # //////////////////////////////////DYNAMICS////////
                        TS1 = (ADC[9] - STARTTIME) * 0.01
                        status = False
                        if right_platform:
                            for i in [4, 5, 6, 7]:
                                WDAT[i - 4] = (CALCAL(OFFSET[ADCCH[i]], ADCVAL[i], i))
                        else:
                            for i in [0, 1, 2, 3]:
                                WDAT[i] = (CALCAL(OFFSET[ADCCH[i]], ADCVAL[i], i))
                        weight_platform = sum(WDAT[:])
                        lasts.pop(0)
                        lasts.append([WDAT[2], WDAT[3], WDAT[0], WDAT[1]])
                        if flag_of_start:
                            ax.tick(WDAT[2], WDAT[3], WDAT[0], WDAT[1])

                        if flag_for_speed:
                            ax_for_speed.tick(WDAT[2], WDAT[3], WDAT[0], WDAT[1])


                        if weight_platform > weight_for_flag:
                            some_iter = 0
                            if not flag_for_speed:
                                ax_for_speed = axisdetector.AxisDetector(L_PLAT)
                                ax_for_speed.set_all_data(lasts.copy())
                                flag_for_speed = True

                            if not flag_of_start:

                                ax = axisdetector.AxisDetector(L_PLAT)
                                ax.set_all_data(lasts.copy())
                                flag_of_start = True
                                SOST_STARTTIME = TS1
                                grgo_start = round(time.time() - time.timezone, 2) * 1000
                        else:
                            if flag_for_speed and some_iter == 50:
                                ax_for_speed.analysis()
                                _dyn_speed = ax_for_speed.speed
                                dyn_speed = round(sum(_dyn_speed) / len(_dyn_speed), 2)
                                print(dyn_speed)
                                flag_for_speed = False
                            some_iter += 1
                            if some_iter == 2000 and flag_of_start:
                                ax.analysis()
                                ax.calc_weights()
                                STEPS = ax.get_train()
                                axis = (ax.weights_in - ax.weights_out) / 2
                                print(axis)
                                direction = bool(ax.direction)
                                print(direction)
                                STEPS[-1][1] = 0
                                STEPS[-1][2] = 0
                                STEPS.append([0, 0, 0, 0, 0])
                                status = True
                                DEFINITION()
                                status = False
                                #f.close()
                                flag_of_start = False
                                some_iter = 0
                                STARTTIME = ADC[9]
                        if TS1 - SOST_STARTTIME >= 0 and GRGO:
                            if grgo_timer == 0:
                                chart1.append([(TS1 - SOST_STARTTIME) * 1000 + grgo_start, weight_platform / 100])
                                grgo_timer = 1
                            else:
                                grgo_timer -= 1
                vals = None
            else:
                vals, LINK = buffer.get_adcs_values()
            time.sleep(0.001)
    except Exception as inst:
        sys_data = {"method": 'main math loop', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        print(inst.args)


def DEFINITION():

    global STEPS
    global TEPL_FIRST
    global WMASS
    global KKORR
    global DISCR
    global DISCR1
    global DISCR_THRES
    global DYNPOV
    global AUTOCAL
    global KKORR_TEMP
    global IZMW_DYN
    global REALW_DYN
    global POVSPD
    global POGKG_DYN
    global POGPS_DYN
    global CURRSOST
    global pov_dyn_real_weight
    global auto_cal_dyn_weight
    global autocal_data
    global dyn_data
    global pov_data
    global direction
    global axis

    TMP = 0.0
    LAST_INDX = 0
    UP_CNT = 0
    DWN_CNT = 0
    UP_INDX = [0] * 2000
    DWN_INDX = [0] * 2000
    AX_DIST = [0] * 2000
    AX_VEL = [0.0] * 2000
    AX_TIME = [0.0] * 2000
    AX_WFAR = [0.0] * 2000
    AX_WNEA = [0.0] * 2000
    AX_WFAR1 = [0.0] * 2000
    AX_WNEA1 = [0.0] * 2000
    IZM_TIME = [0.0] * 2000
    IZM_TIME1 = [0.0] * 2000
    IZM_TIMEB = [0.0] * 2000
    IZM_TIMEB1 = [0.0] * 2000

    try:
        for i in range(1, 3000):
            LAST_INDX = i               #LAST AX OUT
            if STEPS[i][0] == 0:    #TIME
                break

        for i in range(LAST_INDX + 1):
            if STEPS[i][3] == 1:        #UP STEP
                UP_INDX[UP_CNT] = i
                UP_CNT += 1
            elif STEPS[i][3] == 2:      #DWN STEP
                DWN_INDX[DWN_CNT] = i
                DWN_CNT += 1

        UP_CNT -= 1
        DWN_CNT -= 1

        if UP_CNT != DWN_CNT:
            #UP_CNT = DWN_CNT
            clear_data() # clear recognition data
            zeroing_charts()
            zeroing_autocal_data()
            return False  #TODO раскомментить и убрать предыдущую строку

        for i in range(UP_CNT + 1):
            AX_TIME[i] = STEPS[DWN_INDX[i]][0] - STEPS[UP_INDX[i]][0] #AX TIME
            AX_VEL[i] = 0.0036 * L_PLAT / AX_TIME[i] #AX VEL(KM/H)

        for i in range(UP_CNT + 1):
            if i > 0:
                AX_DIST[i] = int((STEPS[UP_INDX[i]][0] - STEPS[UP_INDX[i - 1]][0]) * L_PLAT / AX_TIME[i - 1])
            else:
                AX_DIST[i] = 0

        for i in range(UP_CNT + 1):
            if i > 0:
                AX_WFAR[i] = STEPS[UP_INDX[i]][1] - STEPS[UP_INDX[i] - 1][1]
                AX_WNEA[i] = STEPS[UP_INDX[i]][2] - STEPS[UP_INDX[i] - 1][2]
                IZM_TIME[i] = STEPS[UP_INDX[i] + 1][0] - STEPS[UP_INDX[i]][0]
                IZM_TIMEB[i] = STEPS[UP_INDX[i]][0] - STEPS[UP_INDX[i] - 1][0]
            else:
                AX_WFAR[i] = STEPS[UP_INDX[i]][1]
                AX_WNEA[i] = STEPS[UP_INDX[i]][2]
                IZM_TIME[i] = STEPS[UP_INDX[i] + 1][0] - STEPS[UP_INDX[i]][0]
                IZM_TIMEB[i] = 10

        for i in range(UP_CNT + 1):
            if DWN_INDX[i] > 0:
                AX_WFAR1[i] = STEPS[DWN_INDX[i] - 1][1] - STEPS[DWN_INDX[i]][1]
                AX_WNEA1[i] = STEPS[DWN_INDX[i] - 1][2] - STEPS[DWN_INDX[i]][2]
                IZM_TIME1[i] = STEPS[DWN_INDX[i]][0] - STEPS[DWN_INDX[i] - 1][0]
                IZM_TIMEB1[i] = STEPS[DWN_INDX[i] + 1][0] - STEPS[DWN_INDX[i]][0]
            else:
                clear_data()
                zeroing_charts()
                zeroing_autocal_data()
                return False

        for i in range(UP_CNT + 1):
            if (IZM_TIME[i] + IZM_TIMEB[i] - IZM_TIMEB1[i] - IZM_TIME1[i]) >= 0:
                AX_WFAR[i] = AX_WFAR[i]
                AX_WNEA[i] = AX_WNEA[i]
            else:
                AX_WFAR[i] = AX_WFAR1[i]
                AX_WNEA[i] = AX_WNEA1[i]


        TELE = [[0 for x in range(3)] for z in range(501)]
        TEL_N0 = 0
        TELAX_N0 = 1
        DISTSUM = 0
        i = 1
        while i < UP_CNT + 1:
            if i < UP_CNT:
                if COMP(AX_DIST[i], AX_DIST[i + 1], 150) or (AX_DIST[i + 1] < AX_DIST[i]):
                    TELAX_N0 += 1
                    DISTSUM += int(AX_DIST[i] * 0.8935039)
                else:
                    TELAX_N0 += 1
                    DISTSUM += AX_DIST[i]
                    TELE[TEL_N0][0] = TELAX_N0
                    TELE[TEL_N0][2] = i
                    TELE[TEL_N0][1] = DISTSUM / (TELAX_N0 - 1)

                    TEL_N0 += 1
                    TELAX_N0 = 1
                    DISTSUM = 0
                    i += 1
            else:
                TELAX_N0 += 1
                DISTSUM += int(AX_DIST[i] * 0.8935039)
                TELE[TEL_N0][0] = TELAX_N0
                TELE[TEL_N0][2] = i
                TELE[TEL_N0][1] = DISTSUM / (TELAX_N0 - 1)

            i += 1
        FIRST_TEL = 0
        LAST_TEL = 0

        #'///////////////////////TEPL//////////////////////////
        if (TELE[0][0] > TELE[TEL_N0][0]) and (TELE[0][1] > 1800) and (TELE[TEL_N0][1] < 1950):
            TEPL_FIRST = True
            if TELE[0][0] == TELE[1][0]:
                FIRST_TEL = 2
                LAST_TEL = TEL_N0
        elif (TELE[0][1] < 1950) and (TELE[TEL_N0][1] > 1800) and (TELE[0][0] < TELE[TEL_N0][0]):
            TEPL_FIRST = False
            FIRST_TEL = 0
            LAST_TEL = TEL_N0 - 2
        else:
            clear_data()
            zeroing_charts()
            zeroing_autocal_data()
            return 0

        ###########################

        sostav = []
        for i in TELE[FIRST_TEL:LAST_TEL + 1]:
            tele = {}
            for z in range(i[0]):
                tele.update({"axis_%s" % str(i[0] - z): axis[i[2] - (i[0] - z) + 1]})
            print(tele)
            sostav.append(tele)

        WAGNO = 0
        WFARSUM1 = 0
        WNEASUM1 = 0
        WFARSUM2 = 0
        WNEASUM2 = 0
        VELSUM = 0
        LWAG = 0

        WMASCLEAR()

        #//////////////////WAGONS///////////////////////
        for i in range(FIRST_TEL, LAST_TEL + 1, 2):
            WMASS[WAGNO][6] = 0 #1ST TEL OF WAG
            for j in range(TELE[i][2] - (TELE[i][0] - 1), TELE[i][2] + 1):
                WMASS[WAGNO][6] += int(AX_WFAR[j] + AX_WNEA[j]) * KKORR
                WFARSUM1 += AX_WFAR[j]
                WNEASUM1 += AX_WNEA[j]
                VELSUM += AX_VEL[j]

            i += 1
            WMASS[WAGNO][7] = 0 #2ND TEL OF WAG
            for j in range(TELE[i][2] - (TELE[i][0] - 1), TELE[i][2] + 1):
                WMASS[WAGNO][7] += int(AX_WFAR[j] + AX_WNEA[j]) * KKORR
                WFARSUM2 += AX_WFAR[j]
                WNEASUM2 += AX_WNEA[j]
                VELSUM += AX_VEL[j]

            WMASS[WAGNO][12] = VELSUM / (TELE[i][0] + TELE[i - 1][0])
            WMASS[WAGNO][8] = int(WMASS[WAGNO][6]) - int(WMASS[WAGNO][7])
            WMASS[WAGNO][2] = int(WMASS[WAGNO][6]) + int(WMASS[WAGNO][7])
            WMASS[WAGNO][9] = int(WNEASUM1 + WNEASUM2 - WFARSUM1 - WFARSUM2)
            WMASS[WAGNO][11] = int(((WNEASUM1 + WNEASUM2) / (WNEASUM1 + WNEASUM2 + WFARSUM1 + WFARSUM2)) * 1520 - 1520 / 2)
            LWAG = TELE[i][1] / 2 + TELE[i - 1][1] / 2 + AX_DIST[TELE[i][2] - TELE[i][0] + 1]
            if WMASS[WAGNO][2] == 0:
                WMASS[WAGNO][2] = 1
            WMASS[WAGNO][10] = int((WMASS[WAGNO][7] / WMASS[WAGNO][2]) * LWAG - LWAG / 2)

            WAGNO += 1
            VELSUM = 0
            WFARSUM1 = 0
            WNEASUM1 = 0
            WFARSUM2 = 0
            WNEASUM2 = 0

        #Label419.Text = WAGNO
        #Label317.Text = TEL_N0 + 1 TODO что-то тут передавать в форму

        if TEPL_FIRST:
            print("Тепловоз спереди") #TODO Надо ли? но так уж и быть, отправить
        else:
            print("Тепловоз сзади")

        #####################################
        for i in range(WAGNO):
            for j in [2, 6, 7, 8, 9]:
                if WMASS[i][j] >= DISCR_THRES:
                    discr = DISCR1
                else:
                    discr = DISCR

                if WMASS[i][j] % discr >= discr / 2:
                    WMASS[i][j] = str((WMASS[i][j] // discr) * discr + discr)
                else:
                    WMASS[i][j] = str((WMASS[i][j] // discr) * discr)

        ###########################

        if not DYNPOV and not AUTOCAL:
            _dyn_data = []

            row_id = sqlDriver.get_last_dyn_id()
            for i in range(WAGNO):
                ft_axis_1 = round(sostav[i * 2].get("axis_1"))
                ft_axis_2 = sostav[i * 2].get("axis_2")
                if ft_axis_2:
                    ft_axis_2 = round(ft_axis_2)
                ft_axis_3 = sostav[i * 2].get("axis_3")
                if ft_axis_3:
                    ft_axis_3 = round(ft_axis_3)
                ft_axis_4 = sostav[i * 2].get("axis_4")
                if ft_axis_4:
                    ft_axis_4 = round(ft_axis_4)
                st_axis_1 = round(sostav[i * 2 + 1].get("axis_1"))
                st_axis_2 = sostav[i * 2 + 1].get("axis_2")
                if st_axis_2:
                    st_axis_2 = round(st_axis_2)
                st_axis_3 = sostav[i * 2 + 1].get("axis_3")
                if st_axis_3:
                    st_axis_3 = round(st_axis_3)
                st_axis_4 = sostav[i * 2 + 1].get("axis_4")
                if st_axis_4:
                    st_axis_4 = round(st_axis_4)
                write_date = datetime.datetime.now().strftime("%Y-%m-%d")
                _dyn_data.append({"id": row_id + i, "train_number": CURRSOST, "brutto": WMASS[i][2],
                                  "truck1_weight": int(float(WMASS[i][6])),
                                  "truck2_weight": int(float(WMASS[i][7])), "side_diff": WMASS[i][9],
                                  "offset_lengthwise": WMASS[i][10], "cross_offset": WMASS[i][11],
                                  "speed": float('{:.2f}'.format(WMASS[i][12])), "write_date": write_date,
                                  "write_time": datetime.datetime.now().strftime("%I:%M"), "direction": direction,
                                  "ft_axis_1": ft_axis_1, "ft_axis_2": ft_axis_2, "ft_axis_3": ft_axis_3,
                                  "ft_axis_4": ft_axis_4,
                                  "st_axis_1": st_axis_1, "st_axis_2": st_axis_2, "st_axis_3": st_axis_3,
                                  "st_axis_4": st_axis_4})

            dyn_data = _dyn_data

            print(dyn_data)
            CURRSOST += 1
            sqlDriver.save_strange_table({'CURRSOST': CURRSOST})

        elif AUTOCAL:
            ##########################КАЛИБРОВКА В ДИНАМИКЕ#####################
            coof = []
            for i in range(len(auto_cal_dyn_weight)):
                coof.append(float('{:.3f}'.format(int(auto_cal_dyn_weight[i]) / (float(WMASS[i][2]) * 1000))))
            avrg_coof = sum(coof) / 5
            coof_weight = []
            percent_weight = []
            for i in range(len(auto_cal_dyn_weight)):
                coof_weight.append(float('{:.0f}'.format(avrg_coof * float(WMASS[i][2]) * 1000)))
                percent_weight.append(float('{:.2f}'.format((coof_weight[i] / int(auto_cal_dyn_weight[i])) * 100 - 100)))
            avrg_percent = float('{:.2f}'.format(sum(percent_weight) / 5))
            KKORR_TEMP = avrg_coof
            autocal_data = {'coof': coof, 'avrg_coof': avrg_coof, 'coof_weight': coof_weight,
                            'percent_weight': percent_weight, 'avrg_percent': avrg_percent}
            KKORR = KKORR_TEMP * KKORR
            sqlDriver.save_strange_table({'KKORR': str(KKORR)})
            AUTOCAL = False

        else:
            #######################ПОВЕРКА В ДИНАМИКЕ#######################
            _pov_data = []
            for i in range(len(pov_dyn_real_weight)):
                IZMW_DYN[i] = float(WMASS[i][2])
                POVSPD[i] = WMASS[i][12]
                REALW_DYN[i] = int(pov_dyn_real_weight[i])
                POGKG_DYN[i] = IZMW_DYN[i] - REALW_DYN[i]
                if REALW_DYN[i] != 0:
                    POGPS_DYN[i] = round((POGKG_DYN[i] / REALW_DYN[i]) * 100, 2)
                    if POGKG_DYN[i] < 0:
                        POGKG_DYN[i] = - POGKG_DYN[i]
                else:
                    POGKG_DYN[i] = 0

                _pov_data.append({"id": i + 1, "real_weight": REALW_DYN[i], "measured_weight": IZMW_DYN[i],
                                 "speed": POVSPD[i],  "imprecisionKG": POGKG_DYN[i], "imprecisionPercent": POGPS_DYN[i],
                                  "direction": direction})
            pov_data = _pov_data
            DYNPOV = False

    except Exception as inst:
        sys_data = {"method": 'Definition', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        print(inst.args)

def return_charts():
    global chart1
    global chart2
    global chart3

    if len(chart1) != 0:
        coords1 = chart1[:-1]
        chart1 = chart1[-1:]
    else:
        coords1 = None

    if len(chart2) != 0:
        coords2 = chart2[:-1]
        chart2 = chart2[-1:]
    else:
        coords2 = None

    if len(chart3) != 0:
        coords3 = chart3[:-1]
        chart3 = chart3[-1:]
    else:
        coords3 = None

    return coords1, coords2, coords3


def zeroing_dyn_data():
    global dyn_data
    global dyn_speed
    dyn_data = []
    dyn_speed = 0


def zeroing_autocal_data():
    global autocal_data
    global dyn_speed
    autocal_data = {}
    dyn_speed = 0


def zeroing_pov_data():
    global pov_data
    global dyn_speed
    pov_data = []
    dyn_speed = 0


def WMASCLEAR():
    global WMASS
    for i in range(36):
        for j in range(13):
            WMASS[i][j] = ''


def masfill(page):
    global mas
    global WMASS
    data4 = {'method': "dyn_weight"}
    for j in range(12):
        for i in range(13):
            mas[j][i] = WMASS[page * 12 + j][i]

    data4.update({'data': mas})
    print(data4)
    # send_message(data4) TODO запилить отправку этой даты


def dyn_pov(data):
    global pov_dyn_real_weight
    global DYNPOV
    answer = {"method": "setVerificationDynamic"}
    try:
        pov_dyn_real_weight = data
        DYNPOV = True

        answer.update({"answer": 'ok', "params": {"message": "Dynamic verification is started"}})

    except Exception as inst:
        answer.update({"answer": 'error', "params": {"message": inst.args}})

    return answer

def auto_cal_dyn(data):
    answer = {"method": "setCalibrationDynamic"}

    global AUTOCAL
    global auto_cal_dyn_weight
    try:
        auto_cal_dyn_weight = data
        AUTOCAL = True

        answer.update({"answer": 'ok', "params": {"message": "Calibration is started"}})

    except Exception as inst:
        sys_data = {"method": 'setCalibrationDynamic', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)

        answer.update({"answer": 'error', "params": {"message": inst.args}})

    return answer



def COMP(N, T, DIF):

    if (N - T > DIF) or (N - T < -DIF):
        return False
    else:
        return True


def CALCAL(OFS, COD, CHAN):
    global CAL_TABLE
    SORT = [0] * 10
    _SORT = [''] * 10
    if COD == 0:
        return 0

    last_step_i = 0
    for i in range(10):
        last_step_i = i + 1
        if CAL_TABLE[CHAN][i][1] != 0:
            _SORT[i] = str(CAL_TABLE[CHAN][i][2])
        else:
            break

    if last_step_i - 1 == 0:
        return 0

    _SORT.sort()

    for i in range(10):
        if _SORT[i] == "":
            SORT[i] = 0
        else:
            SORT[i] = int(_SORT[i])

    IDX1 = 0

    IDX3 = 0
    IDX4 = 0
    if COD < 0:
        for i in range(10):
            if SORT[i] != 0:
                IDX1 = SORT[i]
                break
        for i in range(10):
            if CAL_TABLE[CHAN][i][2] == IDX1:
                IDX3 = CAL_TABLE[CHAN][i][1]
                break
        return (COD * IDX3 / IDX1)
    # COD > 0
    IDX2 = 0
    for i in range(10):
        if COD > SORT[i] and SORT[i] != 0:
            IDX1 = SORT[i]
            if i < 9:
                IDX2 = SORT[i + 1]
            else:
                if SORT[i - 1] != 0:
                    IDX1 = SORT[i - 1]
                else:
                    IDX1 = 0
                IDX2 = SORT[i]
                break

    ##############

    if IDX2 == 0:
        for i in range(10):
            if SORT[i] != 0:
                IDX2 = SORT[i]
                break
        for i in range(10):
            if CAL_TABLE[CHAN][i][2] == IDX2:
                IDX4 = CAL_TABLE[CHAN][i][1]
                break
        return (COD * IDX4 / IDX2)

    ##############################

    if IDX1 == 0:
        IDX3 = 0
    else:
        for i in range(10):
            if CAL_TABLE[CHAN][i][2] == IDX1:
                IDX3 = CAL_TABLE[CHAN][i][1]
                break
    for i in range(10):
        if CAL_TABLE[CHAN][i][2] == IDX2:
            IDX4 = CAL_TABLE[CHAN][i][1]
            break

    if (IDX2 - IDX1) == 0:
        IDX2 += 1
    k = (IDX4 - IDX3) / (IDX2 - IDX1)
    return k * (COD - IDX1) + IDX3


def set_attributes(tel, dyn, chart):
    global TEL
    global DYN
    global GRGO
    zeroing_charts()
    GRGO = chart
    TEL = tel
    DYN = dyn


def zeroing_charts():
    global chart1
    global chart2
    global chart3

    chart1 = []
    chart2 = []
    chart3 = []

def get_adc_status():
    from serial_comports import LINK as link, ADC as adc
    answer = {"method": "getADCstatus"}
    try:

        if link and adc:
            adcs = []
            for i in range(8):
                if adc[i] == 0:
                    adcs.append(i + 1)

            if len(adcs) == 0:
                answer.update({"answer": 'ok', "params": {"data": []}})
            else:
                answer.update({"answer": 'ok', "params": {"data": adcs}})
        else:
            answer.update({"answer": 'warning', "params": {"message": "No PDO"}})

    except Exception as inst:
        sys_data = {"method": 'getADCstatus', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer

def set_zero(trucks):
    global WEIGHT
    global WMAX
    global ADC
    global ADCCH
    global OFFSET
    global INV
    answer = {"method": "setZero"}

    try:
        #if float(WEIGHT) < WMAX:
        for z in ADC:
            if type(z) != int:
                raise ValueError('Got not int in adcs data:' + str(z))
        for i in trucks:
            a = i
            if i == 1:
                for j in range(4):
                    OFFSET[ADCCH[j]] = int(ADC[ADCCH[j]])
            else:
                for j in range(4, 8):
                    OFFSET[ADCCH[j]] = int(ADC[ADCCH[j]])
        if len(trucks) == 2:
            answer.update({"answer": 'ok', "params": {"message": 'Zero on both trucks is setted'}})
        else:
            answer.update({"answer": 'ok', "params": {"message": 'Zero on %d truck is setted' % a}})
        sqlDriver.save_adc_settings(INV, ADCCH, OFFSET)
        #else:
        #    answer.update({"answer": 'warning', "params": {"message": 'Weight exceeds the level within which zeroing is possible'}})

    except Exception as inst:
        sys_data = {"method": 'setZero', "exeption": repr(inst)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


def set_platform_params(data):
    global BRB
    global BRH
    global BRW
    global INV
    global ADCCH
    global DISCR
    global DISCR1
    global DISCR_THRES
    answer = {"method": "setCalibrationParams"}
    inv = [0] * 8
    adcch = [0] * 8
    try:
        adcData1 = data['adcData1']
        adcData2 = data['adcData2']
        for i in range(4):
            id1 = adcData1[i]['id'] - 1
            id2 = adcData2[i]['id'] - 1
            inv[id1] = adcData1[i]['inversion']
            inv[id2] = adcData2[i]['inversion']
            adcch[id1] = int(adcData1[i]['number']) - 1
            adcch[id2] = int(adcData2[i]['number']) - 1

        INV = inv
        ADCCH = adcch
        BRB = data['BRB']
        BRH = data['BRH']
        BRW = data['BRW']
        DISCR = int(data['discrete'])
        DISCR1 = int(data['discrete2'])
        DISCR_THRES = int(data['discrete_threshold'])

        save_to_strange_table_data = {"BRB": BRB, "BRH": BRH, "BRW": BRW, "DISCR": DISCR, 'DISCR1': DISCR1,
                                      'DISCR_THRES': DISCR_THRES}
        sqlDriver.save_strange_table(save_to_strange_table_data)

        sqlDriver.save_adc_settings(INV, ADCCH)

        answer.update({"answer": 'ok', "params": {"message": 'Data is saved'}})

    except Exception as inst:
        sys_data = {"method": 'setCalibrationParams', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer

def set_calibration_points(mass):
    global CAL_TABLE
    global ADCVAL
    global ADCCH
    answer = {"method": "setCalibrationPoints"}

    try:
        points = sqlDriver.get_cal_points()
        if list(mass.keys())[0] == '1':
            ves = mass['1']
            weights = points['1']

            a = 0
            for i in range(10):
                a = i
                if weights[i] == 0:
                    break


            summ = ADCVAL[ADCCH[0]] + ADCVAL[ADCCH[1]] + ADCVAL[ADCCH[2]] + ADCVAL[ADCCH[3]]

            if summ == 0:
                summ = 1
            for i in range(4):
                CAL_TABLE[i][a][1] = round(ves * (ADCVAL[ADCCH[i]] / summ))
                CAL_TABLE[i][a][0] = OFFSET[ADCCH[i]]
                CAL_TABLE[i][a][2] = ADCVAL[ADCCH[i]]
            weights[a] = ves
            points.update({"1": weights})
        else:
            ves = mass['2']
            weights = points['2']
            a = 0
            for i in range(10):
                a = i
                if weights[i] == 0:
                    break

            summ = ADCVAL[ADCCH[4]] + ADCVAL[ADCCH[5]] + ADCVAL[ADCCH[6]] + ADCVAL[ADCCH[7]]

            if summ == 0:
                summ = 1
            for i in range(4, 8):
                CAL_TABLE[i][a][1] = round(ves * (ADCVAL[ADCCH[i]] / summ))
                CAL_TABLE[i][a][0] = OFFSET[ADCCH[i]]
                CAL_TABLE[i][a][2] = ADCVAL[ADCCH[i]]
            weights[a] = ves
            points.update({"2": weights})

        sqlDriver.save_cal_points(points)
        sqlDriver.save_cal_tables(CAL_TABLE)
        answer.update({"answer": 'ok', "params": {"message": 'Calibration point setted'}})

    except Exception as inst:
        sys_data = {"method": 'setCalibrationPoints', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


def delete_calibration_points(mass):
    global CAL_TABLE
    answer = {"method": "delCalibrationPoints"}

    try:
        points = sqlDriver.get_cal_points()
        if list(mass.keys())[0] == '1':
            ves = mass['1']
            weights = points['1']
            a = 0
            for i in range(10):
                a = i
                if weights[i] == ves:
                    break

            for i in range(a, 9):
                weights[i] = weights[i + 1]

                for j in range(4):
                    CAL_TABLE[j][i][0] = CAL_TABLE[j][i + 1][0]
                    CAL_TABLE[j][i][1] = CAL_TABLE[j][i + 1][1]
                    CAL_TABLE[j][i][2] = CAL_TABLE[j][i + 1][2]

            weights[9] = 0
            for j in range(4):
                CAL_TABLE[j][9][0] = 0
                CAL_TABLE[j][9][1] = 0
                CAL_TABLE[j][9][2] = 0
            points.update({"1": weights})
        else:
            ves = mass['2']
            weights = points['2']
            a = 0
            for i in range(10):
                a = i
                if weights[i] == ves:
                    break

            for i in range(a, 9):
                weights[i] = weights[i + 1]

                for j in range(4, 8):
                    CAL_TABLE[j][i][0] = CAL_TABLE[j][i + 1][0]
                    CAL_TABLE[j][i][1] = CAL_TABLE[j][i + 1][1]
                    CAL_TABLE[j][i][2] = CAL_TABLE[j][i + 1][2]

            weights[9] = 0
            for j in range(4, 8):
                CAL_TABLE[j][9][0] = 0
                CAL_TABLE[j][9][1] = 0
                CAL_TABLE[j][9][2] = 0
            points.update({"2": weights})

        sqlDriver.save_cal_points(points)
        sqlDriver.save_cal_tables(CAL_TABLE)
        answer.update({"answer": 'ok', "params": {"message": 'Calibration point deleted'}})

    except Exception as inst:
        sys_data = {"method": 'delCalibrationPoints', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args[0]}})

    return answer


def set_configuration_dynamic(data):
    global W_THRES
    global Z_LEVEL
    global CALMTIME
    global L_PLAT

    answer = {"method": "setConfigurationDynamic"}

    try:
        W_THRES = int(data['speedthreshold'])
        Z_LEVEL = int(data['zerothreshold'])
        CALMTIME = int(data['calming'])
        L_PLAT = int(data['platform'])

        save_data = {"W_THRES": W_THRES, "Z_LEVEL": Z_LEVEL, "CALMTIME": CALMTIME, "L_PLAT": L_PLAT}
        sqlDriver.save_strange_table(save_data)

        answer.update({"answer": 'ok', "params": {"message": "Data is saved"}})

    except Exception as inst:
        sys_data = {"method": 'setConfigurationDynamic', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args}})

    return answer

def set_configuration(data):
    global WMAX
    global COMPTT
    global SPEEDT
    global TABLUSE
    global GOST
    global CTMAXX
    global CTMAXY
    global WTHR
    global PERIOD
    global right_platform
    global TEL

    answer = {"method": "setConfiguration"}

    try:
        WMAX = data['maximum_weight_at_zeroing']
        COMPTT = data['display_com_port']
        SPEEDT = data['display_baud_rate']
        TABLUSE = data['display_turned']
        GOST = data['gost']
        CTMAXX = data['longitudinal']
        CTMAXY = data['transverse']
        WTHR = data['threshold']
        PERIOD = data['period']
        right_platform = data['platform_for_dynamic']
        TEL = data['wagon_weighing']
        save_data = {"WMAX": WMAX, "COMPTT": COMPTT, "SPEEDT": SPEEDT, "TABLUSE": TABLUSE, "GOST": GOST,
                     "CTMAXX": CTMAXX, "CTMAXY": CTMAXY, "WTHR": WTHR, "PERIOD": PERIOD, "right_platform": right_platform,
                     'TELWAG': TEL}
        sqlDriver.save_strange_table(save_data)

        answer.update({"answer": 'ok', "params": {"message": "Data is saved"}})

    except Exception as inst:
        sys_data = {"method": 'setConfiguration', "exeption": str(inst.args)}
        sqlDriver.set_system_log(sys_data)
        answer.update({"answer": 'error', "params": {"message": inst.args}})

    return answer



def tablo():
    global TABLUSE
    global COMPTT
    global SPEEDT
    global WEIGHT

    while TABLUSE:
        serial_comports.write_to_tablo(COMPTT, SPEEDT, float(WEIGHT))

        time.sleep(1)

def caca():

    global STARTTIME
    global WEIGHT_SPEED
    global WEIGHT_SPEED_OLD
    global TS0
    global TS1
    global SOST_STARTTIME

    ADC, link = serial_comports.get_adcs_values()
    if ADC:
        STARTTIME = ADC[9]
    else:
        STARTTIME = 0
    WEIGHT_SPEED = 0
    WEIGHT_SPEED_OLD = 0
    TS0 = STARTTIME
    TS1 = STARTTIME
    SOST_STARTTIME = STARTTIME
    _thread.start_new_thread(Timer2_Tick, ())
    _thread.start_new_thread(tablo, ())

