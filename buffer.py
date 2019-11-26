import time
import serial_comports
adc = [] * 1000
LINK = False

def check_different():
    global adc
    global LINK
    oldadc = []
    while True:

        ADC, LINK = serial_comports.get_adcs_values()
        if ADC:
            if oldadc != ADC:

                adc.append(ADC)

            oldadc = ADC.copy()

        time.sleep(0.001)


def get_adcs_values():
    global adc
    global LINK
    try:
        value = adc.copy()
        adc = []
    except:

        value = None

    return value, LINK
