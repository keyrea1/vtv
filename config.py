# -*- coding: utf-8 -*-
"""
    vtv-shell.config module
    ~~~~~~~~~~~~~~~~~~~~~~~~
    This module contains configuration for backend of vtv-shell.
    v.0.0.1
    :copyright: (c) 2018 ZVO
"""
# POSTGRESQL
db_user = 'postgres'
db_password = 'root'
db_host = '127.0.0.1'
db_port = 5432
db_name = 'vtvbase'

# PORTS
recognitionPort = 2327
accessPort = 2328
statusPort = 2329

# COMPORTS
adc_baudrate = 115200
tablo_baudrate = 9600
adc_pkg_size = 24
#adc_stopbits = serial.STOPBITS_ONE    import serial
#adc_bytesize = serial.EIGHTBITS


#keys
keys = [{'key': '000'}, {'static_wagon': True, 'key': '007'}, {'recognition': True, 'key': '037'}, {'rfid': True, 'key': '043'}, {'one_c': True, 'key': '053'}, {'recognition': True, 'rfid': True, 'key': '080'}, {'recognition': True, 'one_c': True, 'key': '090'}, {'rfid': True, 'one_c': True, 'key': '096'}, {'recognition': True, 'rfid': True, 'one_c': True, 'key': '133'}, {'dynamic': True, 'key': '130'}, {'dynamic': True, 'recognition': True, 'key': '167'}, {'dynamic': True, 'rfid': True, 'key': '173'}, {'dynamic': True, 'one_c': True, 'key': '183'}, {'dynamic': True, 'recognition': True, 'rfid': True, 'key': '210'}, {'dynamic': True, 'recognition': True, 'one_c': True, 'key': '220'}, {'dynamic': True, 'rfid': True, 'one_c': True, 'key': '226'}, {'dynamic': True, 'recognition': True, 'rfid': True, 'one_c': True, 'key': '263'}, {'dosing': True, 'key': '029'}, {'dosing': True, 'recognition': True, 'key': '066'}, {'dosing': True, 'rfid': True, 'key': '072'}, {'dosing': True, 'one_c': True, 'key': '082'}, {'dosing': True, 'recognition': True, 'rfid': True, 'key': '109'}, {'dosing': True, 'recognition': True, 'one_c': True, 'key': '119'}, {'dosing': True, 'rfid': True, 'one_c': True, 'key': '125'}, {'dosing': True, 'recognition': True, 'rfid': True, 'one_c': True, 'key': '162'}, {'static_wagon': True, 'dynamic': True, 'key': '137'}, {'static_wagon': True, 'dynamic': True, 'recognition': True, 'key': '174'}, {'static_wagon': True, 'dynamic': True, 'rfid': True, 'key': '180'}, {'static_wagon': True, 'dynamic': True, 'one_c': True, 'key': '190'}, {'static_wagon': True, 'dynamic': True, 'recognition': True, 'rfid': True, 'key': '217'}, {'static_wagon': True, 'dynamic': True, 'recognition': True, 'one_c': True, 'key': '227'}, {'static_wagon': True, 'dynamic': True, 'rfid': True, 'one_c': True, 'key': '233'}, {'static_wagon': True, 'dynamic': True, 'recognition': True, 'rfid': True, 'one_c': True, 'key': '270'}, {'static_wagon': True, 'dosing': True, 'key': '036'}, {'static_wagon': True, 'dosing': True, 'recognition': True, 'key': '073'}, {'static_wagon': True, 'dosing': True, 'rfid': True, 'key': '079'}, {'static_wagon': True, 'dosing': True, 'one_c': True, 'key': '089'}, {'static_wagon': True, 'dosing': True, 'recognition': True, 'rfid': True, 'key': '116'}, {'static_wagon': True, 'dosing': True, 'recognition': True, 'one_c': True, 'key': '126'}, {'static_wagon': True, 'dosing': True, 'rfid': True, 'one_c': True, 'key': '132'}, {'static_wagon': True, 'dosing': True, 'recognition': True, 'rfid': True, 'one_c': True, 'key': '169'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'key': '166'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'recognition': True, 'key': '203'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'rfid': True, 'key': '209'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'one_c': True, 'key': '219'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'recognition': True, 'rfid': True, 'key': '246'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'recognition': True, 'one_c': True, 'key': '256'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'rfid': True, 'one_c': True, 'key': '262'}, {'static_wagon': True, 'dynamic': True, 'dosing': True, 'recognition': True, 'rfid': True, 'one_c': True, 'key': '299'}]
