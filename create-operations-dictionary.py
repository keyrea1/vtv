from random import uniform, random, choice, randint

LENGTH = 100
user = [1, 2, 3]
cargo = ["щебень", "песок", "цемент", "кости", "человечина", "мясо", "кабанина", "оленина", "свитера", "асфальт", "марихуанна", "кокс", "зерно", "мука", "протеин", "футболисты"]
wagon_type = ["крытый", "полувагон", "вагон-цистерна", "думпкар", "хоппер", "платформа", "фитинговая платформа", "бункерного типа", "транспортёр", "автомобилевоз", "вагон-кенгур", "изотермический", "вагон-ледник", "рефрижераторный", "вагон-термос"]
wagon_number = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 24, 32, 14, 15, 17, 20, 22, 35]
destination_point = ["Москва", "Санкт-Петербург", "Владивосток", "Токио", "Осака", "Пекин", "Рязань", "Магнитогорск", "Белорецк", "Кага", "Симферопль", "Красноярск"]
transporter = ["СДЭК", "Молния", "ООО Эдельвейс", "ООО ММК", "ООО Почта России", "ООО РЖД", "ООО Клановец", "ООО МЖК", "ООО Траспортная компания", "GmbH BOSCH"]
brutto = []
truck_weight = [140.5, 320.5, 226.6, 123.45, 430.25, 240.24, 320.25, 125.5, 300.5]
capacity = [120, 150, 160, 155, 190, 200, 220, 215, 210]
doc_cargo_weight = [120.6, 76.4, 34.3, 200, 179.1, 215, 120, 160, 100, 0]
doc_date = ["2019-01-01", "2019-02-01", "2019-03-01", "2019-04-01", "2019-05-01", "2018-31-12", "2018-30-12", "2018-29-12", "2018-28-12", "2018-27-12"]
doc_number = ["123456789", "ОЛ-987654321", "ГЛ/1122334455", "ФЗ-6677889900", "ПЛ-123459876", "5432167890ОР", "6789054321ХУ", "6712907834Ы", "123456789", "123456789"]
date = "2019-09-01"
time = "17:39"

result = []

for i in range(LENGTH):
    _cargo_weight = choice(doc_cargo_weight)
    if _cargo_weight == 0:
        _brutto = _cargo_weight + choice(capacity)
        _cargoName = "{0}".format(choice(cargo))
        result.append({"id": i,
                       "date": date,
                       "time": time,
                       "direction": "{0}".format(choice([True, False])),
                       "wagon_number": choice(wagon_number),
                       "start_weight": _brutto,
                       "doc_start_weight": _brutto,
                       "brutto": _brutto,
                       "doc_cargo_weight": _brutto,
                       "doc_number": "{0}".format(choice(doc_number)),
                       "doc_date": "{0}".format(choice(doc_date)),
                       "cargo_name": _cargoName,
                       "capacity": choice,
                       "truck1_weight": choice(truck_weight),
                       "truck2_weight": choice(truck_weight),
                       "side_diff": 0.04,
                       "offset_lengthwise": 0.45,
                       "cross_offset": 0.15,
                       "speed": "{0}".format(round(uniform(0, 5), 2)),
                       "sender": "{0}".format(choice(transporter)),
                       "reciever": "{0}".format(choice(transporter)),
                       "transporter": "{0}".format(choice(transporter)),
                       "departure_point": "{0}".format(choice(destination_point)),
                       "destination_point": "{0}".format(choice(destination_point)),
                       "cargo": _cargoName,
                       "user": 3,
                       "axels_count": "{0}".format(choice([2, 3, 4])),
                       "photo_path": "",
                       "train_number": randint(1, 27),
                       "wagon_type": "{0}".format(choice(wagon_type)),
                       "optional1": "",
                       "optional2": "",
                       "optional3": "",
                       "optional4": "",
                       "optional5": "",
                       "autofilling": "False"
                       })
    else:
        _brutto = _cargo_weight + choice(capacity)
        _cargoName = "{0}".format(choice(cargo))
        result.append({"id": i,
                        "date": date,
                        "time": time,
                        "direction": "{0}".format(choice([True, False])),
                        "wagon_number": choice(wagon_number),
                        "start_weight": _brutto,
                        "doc_start_weight": _brutto,
                        "brutto": _brutto,
                        "cargo_weight": _cargo_weight,
                       "doc_cargo_weight": _cargo_weight,
                       "doc_number": "{0}".format(choice(doc_number)),
                       "doc_date": "{0}".format(choice(doc_date)),
                       "cargo_name": _cargoName,
                       "capacity": choice,
                        "truck1_weight": choice(truck_weight),
                        "truck2_weight": choice(truck_weight),
                       "side_diff": 0.04,
                       "offset_lengthwise": 0.45,
                       "cross_offset": 0.15,
                       "speed": "{0}".format(round(uniform(0, 5), 2)),
                       "sender": "{0}".format(choice(transporter)),
                       "reciever": "{0}".format(choice(transporter)),
                       "transporter": "{0}".format(choice(transporter)),
                       "departure_point": "{0}".format(choice(destination_point)),
                       "destination_point": "{0}".format(choice(destination_point)),
                       "cargo": _cargoName,
                       "user": 3,
                       "axels_count": "{0}".format(choice([2, 3, 4])),
                       "photo_path": "",
                       "train_number": randint(1, 27),
                       "wagon_type": "{0}".format(choice(wagon_type)),
                       "optional1": "",
                       "optional2": "",
                       "optional3": "",
                       "optional4": "",
                       "optional5": "",
                       "autofilling": "False"
                   })

print("-------------")
print(result)





















