# -*- coding: utf-8 -*-
"""
    vtv-shell.main backend module
    ~~~~~~~~~~~~~~~~~~~~~~~~
    This module contains start functions for other modules
    v.0.0.1
    :copyright: (c) 2018 ZVO
"""

import datetime
import serial_comports
import _thread
import weight_math
import time
import buffer
import accesExchange
import sqlDriver
import os

MODULE = 'main'
timeStart = datetime.datetime.now()


def main():
    global timeStart
    timeStart = datetime.datetime.now()
    #_thread.start_new_thread(serial_comports.check_ports, ())
    _thread.start_new_thread(serial_comports.read_file, ())
    time.sleep(3)
    sqlDriver.checkdb()
    weight_math.COLLECT()
    _thread.start_new_thread(buffer.check_different, ())
    weight_math.caca()
    time.sleep(1)
    accesExchange.start()
    some_iterator = 0
    while True:
        #from server import flag_to_close as flag
        #from accesExchange import setFlagToExit, getFlagToExit
        #if flag:
        #    os._exit(1)
        #flag2 = getFlagToExit()
        #if flag2:
        #    some_iterator += 1
        #    if some_iterator == 3:
        #        sys_data = {"method": "lost ping from frontend", "exeption": "Without exception"}
        #        sqlDriver.set_system_log(sys_data)
        #        os._exit(1)
        #else:
        #    some_iterator = 0

        #setFlagToExit()

        time.sleep(1.5)


if __name__ == "__main__":
    main()
