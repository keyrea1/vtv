import sys
import glob
import serial
import time
import struct
import serial.tools.list_ports
from config import adc_baudrate as baudrate, adc_pkg_size as pkg_size

flag = True
LINK = False
adc = []
ADC = []
def serial_ports():
    result = []
    myports = [tuple(p) for p in list(serial.tools.list_ports.comports())]
    for port in myports:
        result.append(port[0])
    #if sys.platform.startswith('win'):
    #    ports = ['COM%s' % (i + 1) for i in range(256)]
    #elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
    #    # this excludes your current terminal "/dev/tty"
    #    ports = glob.glob('/dev/tty[A-Za-z]*')
    #elif sys.platform.startswith('darwin'):
    #    ports = glob.glob('/dev/tty.*')
    #else:
    #    raise EnvironmentError('Unsupported platform')
#
    #result = []
    #for port in ports:
    #    try:
    #        s = serial.Serial(port)
    #        s.close()
    #        result.append(port)
    #    except (OSError, serial.SerialException):
    #        pass
    return result


def serial_read(port):
    global adc
    global LINK
    global flag
    global ADC
    ser = serial.Serial(
        port=port,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS
    )
    ser.baudrate = baudrate
    ser.timeout = None

    try:
        while True:

            time.sleep(0.001)

            while ser.inWaiting():
                rcv_data = []
                values = []
                for i in range(pkg_size):
                    out = ser.read()
                    _out = int(out.hex(), 16)
                    rcv_data.append(_out)

                for j in range(int(pkg_size / 2)):
                    values.append(int(rcv_data[j] + rcv_data[j + int(pkg_size / 2)] * 256))

                if values[11] == sum(values[:-1]) % 65536:
                    #print(values, "YAY!")
                    VALUE = to_value(values)

                    adc.append(VALUE)
                    ADC = VALUE.copy()
                    #print(ADC)
                    LINK = True
                    #ser.flush()
                    #ser.flushInput()
                    #ser.flushOutput()


                    #print(VALUE)
                else:
                    print("NAY!!")
                    ser.close()
                    ser.open()
                time.sleep(0.001)
    except serial.serialutil.SerialException as inst:
        print(inst)
        flag = True
        LINK = False


def write_to_tablo(port, speed, weight):
    try:
        ser = serial.Serial(
            port=port,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS
        )
        if speed != '':
            ser.baudrate = int(speed)
        else:
            ser.baudrate = 9600
        ser.timeout = None

        data = convert(weight)
        ser.flush()
        for c in range(2):
            for i in data:
                l = i.to_bytes(1, 'big')
                ser.write(l)
            time.sleep(0.01)

    except serial.serialutil.SerialException as inst:
        print(inst)


def convert(VAL):
    TXBUF = bytearray([0] * 37)

    try:
        FB = bytearray(struct.pack("f", VAL))

        TXBUF[0] = 2
        TXBUF[1] = 3
        TXBUF[2] = 32
        for i in range(3, 35, 4):
            TXBUF[i] = FB[3]
            TXBUF[i + 1] = FB[2]
            TXBUF[i + 2] = FB[1]
            TXBUF[i + 3] = FB[0]

        CS = CRC16(TXBUF, 35)
        TXBUF[35] = CS % 256
        TXBUF[36] = CS // 256

    except Exception as inst:
        print(inst.args)

    return TXBUF



def CRC16(data, lenght):
    crcfull = 0xFFFF

    try:
        for i in range(lenght):
            crcfull = crcfull ^ data[i]
            for j in range(8):
                crclsb = crcfull & 0x1
                crcfull = crcfull >> 1
                if crclsb != 0:
                    crcfull = crcfull ^ 0xA001

        crchigh = (crcfull >> 8) & 0xFF
        crclow = crcfull & 0xFF
        crcfull = crchigh * 256 + crclow
    except Exception as inst:
        print(inst.args)
    return crcfull

def to_value(values):
    _VALUE = []
    for k in range(9):
        _VALUE.append(int(values[k]))
    _VALUE.append(int(values[9] + values[10] * 65536))

    return _VALUE


def read_file():
    global LINK
    global adc
    global ADC

    while True:
        #f = open('1_PRO.dat', 'rb')
        with open('331.dat', 'rb') as f:
            chars = 0
            for line in f:
                wordslist = line.split()
                chars += sum(len(word) for word in wordslist)
            #print(chars)
            f.close()
        f = open('331.dat', 'rb')
        a = 0
        while a < chars:
            LINK = True
            rcv_data = []
            values = []
            for i in range(1, 25):
                rcv_data.append(int(f.read(1).hex(), 16))

            for j in range(int(12)):
                values.append(rcv_data[j] + rcv_data[j + int(pkg_size / 2)] * 256)
            #print(values)

            if values[11] == sum(values[:-1]) % 65536:
                #print(values, "YAY!")
                VALUE = to_value(values)
                #print(str(VALUE[9]) + "COM")
                ADC = VALUE
                adc.append(VALUE)
                #print(VALUE)

            a += 24
            time.sleep(0.008)
        LINK = False
        f.close()
        time.sleep(0.001)


def read_file2():
    global ADC
    global LINK
    global adc
    while True:
        f = open('15слева.txt')
        time.sleep(5)
        for line in f:
            LINK = True
            mass = []
            _adc = line.strip().split(']')[0].split('[')[1].split(', ')
            for i in _adc:
                mass.append(int(i))
            ADC = mass
            adc.append(ADC)
            time.sleep(0.01)
        LINK = False
        f.close()
        time.sleep(0.001)


def check_ports():

    while True:
        global flag
        port = ''
        while flag:
            myports = [tuple(p) for p in list(serial.tools.list_ports.comports())]
            for d in myports:
                if 'USB-SERIAL CH340' in d[1]:
                    possible_port = d[0]
                    try:
                        ser = serial.Serial(
                            port=possible_port,
                            parity=serial.PARITY_NONE,
                            stopbits=serial.STOPBITS_ONE,
                            bytesize=serial.EIGHTBITS
                        )
                        ser.baudrate = baudrate
                        ser.timeout = None
                        time.sleep(0.01)
                        if ser.in_waiting > 0:
                            for e in range(10):
                                rcv_data = []
                                values = []
                                for i in range(pkg_size):
                                    out = ser.read()
                                    _out = int(out.hex(), 16)
                                    rcv_data.append(_out)

                                for j in range(int(pkg_size / 2)):
                                    values.append(int(rcv_data[j] + rcv_data[j + int(pkg_size / 2)] * 256))

                                if values[11] == sum(values[:-1]) % 65536:
                                    port = possible_port
                                    flag = False
                                    break

                                else:
                                    ser.close()
                                    ser.open()
                                time.sleep(0.001)
                                print(e)

                    except:
                        print('ENAY')
                    finally:
                        if flag:
                            print('NAY')
                        else:
                            ser.close()
                            break
                time.sleep(1)
        serial_read(port)

        time.sleep(1)


def get_adcs_values():
    global adc
    global LINK

    try:
        value = adc.pop(0)

    except:

        value = None

    return value, LINK


#serial_read('COM3')
print(serial_ports())
