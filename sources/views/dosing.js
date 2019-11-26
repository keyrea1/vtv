import {JetView} from 'webix-jet'
import StaticTActionsWagon from 'views/datatables/statictactionswagon'

export default class Dosing extends JetView {
  config () {
    const lang = this.app.getService('locale').getLang()
    const _ = this.app.getService('locale')._
    const theme = this.app.config.theme
    const ids = this.app.config.ids
    const hideOptions = this.app.config.hideOptions
    const hidden = this.app.config.weighing['statichidden']
    const ip = this.app.config.remoteHOST
    var weighingConfiguration = $$('mainTop').$scope.app.config.weighing
    const referenceView = this
    const User = this.app.config.user
    const Type = 'static.wagon'
    const access = this.app.config.globals.access
    const config = $$('mainTop').$scope.app.config
    const table = 'static_operations_wagon'

    function setWeigth (weigth) {
        var _methodName = "startDosing";
        webix.ajax().post(
          ip,
          {"method": _methodName, "user": User, "params": weigth},
          function (text, xml, xhr) {
            var data = JSON.parse(text);
            console.log(data);
          });
    }

    var staticWagonTimer = true;

    function img (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:410px;height:190px;"' + '/>'
    }

    function img_valves (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:410px;height:140px;"' + '/>'
    }

    function img_valves_status (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:60px;height:130px;"' + '/>'
    }

    function img2 (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:130px;height:200px;"' + '/>'
    }

    function img_lights (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:130px;height:160px;"' + '/>'
    }

    function setWidth () {
      if (lang === 'ru') {
        return 80
      } else return 125
    }

    var dt1 = 'dt1' + ids.dt1
    var win1 = 'win1' + ids.win1
    var win2 = 'wagonNumberWindows' + ids.win1
    var numberOfWagon = 'numberOfWagon' + ids.win1
    var close = 'close' + ids.close
    ids.dt1 = ids.dt1 + 1
    ids.win1 = ids.win1 + 1
    ids.wagonNumberWindowStatic = win2
    ids.close = ids.close + 1
    newv => this.app.config.ids = ids

    var data = [
      {'collumn': _('date'), 'column': 'write_date', 'hide': hideOptions[Type].date},
      {'collumn': _('time'), 'column': 'write_time', 'hide': hideOptions[Type].time},
      {'collumn': _('train_number'), 'column': 'train_number', 'hide': hideOptions[Type].train_number},
      {'collumn': _('wagon_number'), 'column': 'wagon_number', 'hide': hideOptions[Type].wagon_number},
      {'collumn': _('start_weight'), 'column': 'start_weight', 'hide': hideOptions[Type].start_weight},
      {
        'collumn': _('doc_start_weight'),
        'column': 'doc_start_weight',
        'hide': hideOptions[Type].doc_start_weight
      },
      {'collumn': _('brutto'), 'column': 'brutto', 'hide': hideOptions[Type].brutto},
      {'collumn': _('cargo_weight'), 'column': 'cargo_weight', 'hide': hideOptions[Type].cargo_weight},
      {'collumn': _('overload'), 'column': 'overload', 'hide': hideOptions[Type].overload},
      {
        'collumn': _('doc_cargo_weight'),
        'column': 'doc_cargo_weight',
        'hide': hideOptions[Type].doc_cargo_weight
      },
      {'collumn': _('doc_number'), 'column': 'doc_number', 'hide': hideOptions[Type].doc_number},
      {'collumn': _('doc_date'), 'column': 'doc_date', 'hide': hideOptions[Type].doc_date},
      {'collumn': _('cargo_name'), 'column': 'cargo_name', 'hide': hideOptions[Type].cargo_name},
      {'collumn': _('capacity_for_oper_table'), 'column': 'capacity', 'hide': hideOptions[Type].capacity},
      {'collumn': _('truck1_weight'), 'column': 'truck1_weight', 'hide': hideOptions[Type].truck1_weight},
      {'collumn': _('truck2_weight'), 'column': 'truck2_weight', 'hide': hideOptions[Type].truck2_weight},
      {'collumn': _('truck_diff'), 'column': 'truck_diff', 'hide': hideOptions[Type].truck_diff},
      {'collumn': _('side_diff'), 'column': 'side_diff', 'hide': hideOptions[Type].side_diff},
      {
        'collumn': _('offset_lengthwise'),
        'column': 'offset_lengthwise',
        'hide': hideOptions[Type].offset_lengthwise
      },
      {'collumn': _('cross_offset'), 'column': 'cross_offset', 'hide': hideOptions[Type].cross_offset},
      {'collumn': _('sender'), 'column': 'sender', 'hide': hideOptions[Type].sender},
      {'collumn': _('reciever'), 'column': 'reciever', 'hide': hideOptions[Type].reciever},
      {'collumn': _('transporter'), 'column': 'transporter', 'hide': hideOptions[Type].transporter},
      {'collumn': _('departure_point'), 'column': 'departure_point', 'hide': hideOptions[Type].departure_point},
      {
        'collumn': _('destination_point'),
        'column': 'destination_point',
        'hide': hideOptions[Type].destination_point
      },
      {'collumn': _('cargo'), 'column': 'cargo', 'hide': hideOptions[Type].cargo},
      {'collumn': _('axels_count'), 'column': 'axels_count', 'hide': hideOptions[Type].axels_count},
      {'collumn': _('photo_path'), 'column': 'photo_path', 'hide': hideOptions[Type].photo_path},
      {'collumn': _('wagon_type'), 'column': 'wagon_type', 'hide': hideOptions[Type].wagon_type},
      {'collumn': _('autofilling'), 'column': 'autofilling', 'hide': hideOptions[Type].autofilling},
      {'collumn': _('lastdateedited'), 'column': 'lastdateedited', 'hide': hideOptions[Type].lastdateedited},
      {'collumn': _('lasttimeedited'), 'column': 'lasttimeedited', 'hide': hideOptions[Type].lasttimeedited},
      {'collumn': _('lasttimeeditor'), 'column': 'lasttimeeditor', 'hide': hideOptions[Type].lasttimeeditor},
      {'collumn': _('optional1'), 'column': 'optional1', 'hide': hideOptions[Type].optional1},
      {'collumn': _('optional2'), 'column': 'optional2', 'hide': hideOptions[Type].optional2},
      {'collumn': _('optional3'), 'column': 'optional3', 'hide': hideOptions[Type].optional3},
      {'collumn': _('optional4'), 'column': 'optional4', 'hide': hideOptions[Type].optional4},
      {'collumn': _('optional5'), 'column': 'optional5', 'hide': hideOptions[Type].optional5}]

    const hidOptions = {
      view: 'datatable',
      editable: true,
      scroll: 'y',
      css: theme,
      id: dt1,
      drag: true,
      data: data,
      columns: [
        {id: 'collumn', header: _('Column'), css: 'rank', width: 250},
        {id: 'column', hidden: true},
        {
          id: 'hide', header: _('Hide'), width: 75, template: data => {
            if (data.hide === true) {
              return "<div class='hide_element'></div>"
            } else {
              return "<div class='show_element'></div>"
            }
          }
        }
      ],
      on: {
        'onItemClick': function (id, e, trg) {
          var item = ($$(dt1).getItem(id.row))
          hideOptions[Type][item.column] = item.hide
          newv => this.app.config.hideOptions = hideOptions
          if (item.hide === false) {
            item.hide = true
            $$('static_operations_wagon').hideColumn(item.column)
            $$(dt1).updateItem(id, item)
          } else {
            item.hide = false
            $$('static_operations_wagon').showColumn(item.column)
            $$(dt1).updateItem(id, item)
          }
        }
      }
    }

    const popUp = {
      view: 'window',
      css: theme,
      id: win1,
      height: 600,
      width: 350,
      move: true,
      head: {
        view: 'toolbar', margin: -4, cols: [
          {view: 'label', label: _('Table configurator: Statics'), width: 280},
          {
            view: 'label',
            template: function (obj) {
              var html = "<div class='del_element'>"
              return html + '</div>'
            },
            click: function () {
              $$(win1).hide()
            }
          }
        ]
      },
      body: {
        rows: [
          hidOptions,
          {
            view: 'toolbar', margin: -4, cols: [
              {
                view: 'button', id: close, value: _('Save'), click: function () {
                  var report_columns = {}
                  var i = 1
                  $$(dt1).eachRow(function (row) {
                    const record = $$(dt1).getItem(row)
                    // { id:row, title:"Film", year:2019 }
                    if (record.hide !== true) {
                      report_columns[record.column] = i
                      i = i + 1
                    } else {
                      report_columns[record.column] = 0
                      i = i + 1
                    }
                  })
                  report_columns['user'] = User
                  setHidOptions(report_columns)
                  $$(win1).hide()
                }
              }
            ]

          }]
      }
    }

    var wagonNumberWindow = webix.ui({
      view: "window",
      css: theme,
      id: win2,
      height: 300,
      width: 300,
      move: true,
      head: {
        view: "toolbar", margin: -4, cols: [
          {view: "label", label: _("Enter the weight for dosing"), width: 260},
          {
            view: "label",
            template: function (obj) {
              var html = "<div class='del_element'>";
              return html + "</div>";
            },
            click: function () {
              $$(win2).hide();
            }
          },
        ]
      },
      body: {
        rows: [
          {
            cols: [
              {},
              {view: "label", label: _("Weight for dosing"), width: 130},
              {
                view: "text", width: 150, id: numberOfWagon,
                on: {
                  "onEnter": function (state, editor, ignoreUpdate) {
                    var flag = false;
                    var wagonNumber = parseInt($$(numberOfWagon).getValue());
                    if (wagonNumber.length !== 0 && !isNaN(wagonNumber)) {
                      $$("static_operations_wagon").eachRow(function (row) {
                        const record = $$("static_operations_wagon").getItem(row);
                        if (parseInt(wagonNumber) === parseInt(record.wagon_number) && !flag) {
                          updateWeight(record.id, wagonNumber);
                          $$(win2).hide();
                          flag = true;
                          $$(numberOfWagon).setValue("");
                        }
                      });
                      if (!flag) {
                        setWeigth(wagonNumber);
                        $$(numberOfWagon).setValue("");
                        $$(win2).hide();
                      }
                    }
                    else {
                      webix.message({type: "error", text: _("Enter the correct weight")});
                    }
                  }
                }
              },
              {}
            ]
          },
          {
            view: "toolbar", margin: -4, cols: [
              {},
              {
                view: "button", width: 150, value: _("Approve"),
                click: function () {
                  var flag = false;
                  var wagonNumber = parseInt($$(numberOfWagon).getValue());
                  if (wagonNumber.length !== 0 && !isNaN(wagonNumber)) {
                    $$("static_operations_wagon").eachRow(function (row) {
                      const record = $$("static_operations_wagon").getItem(row);
                      if (parseInt(wagonNumber) === parseInt(record.wagon_number) && !flag) {
                        updateWeight(record.id, wagonNumber);
                        $$(win2).hide();
                        flag = true;
                        $$(numberOfWagon).setValue("");
                      }
                    });
                    if (!flag) {
                      setWeigth(wagonNumber);
                      $$(numberOfWagon).setValue("");
                      $$(win2).hide();
                    }
                  }
                  else {
                    webix.message({type: "error", text: _("Enter the wagon number")});
                  }
                }
              },
              {}
            ]
          }]
      }
    });

    const main = {
      rows: [
        {
          view: 'toolbar', css: theme,
          elements: [
            {view: 'label', label: _('Dosing'), width: 150},
            {minWidth: 4},
            {
              view: 'button', value: _('Emergency stop'),
              css: 'bt_2',
              width: 260,
              click: function () {

              }
            },
            {width: 6}
          ]
        },
        {
          id: 'static-wagon-view', template: ' ', hidden: hidden, rows: [
            {
              height: 10
            },
            {
              type: 'wide',
              rows: [
                {
                  height: 405,
                  type: 'wide',
                  cols: [
                    {},
                    {
                      rows: [
                        {
                          view: 'toolbar', css: 'no-borders',
                          elements: [
                            {
                              rows: [
                                {
                                  cols: [
                                    {label: _('Bunker'), view: 'label', width: 105, css: 'grey'},
                                    {},
                                    {label: _('Feed mechanism'), view: 'label', width: 155, css: 'grey'},
                                    {
                                      view: 'button',
                                      type: 'image',
                                      label: _(''),
                                      width: 40,
                                      image: 'sources/styles/ellipse.svg'
                                    }
                                  ]
                                },
                                {
                                  height: 140, cols: [
                                    {template: img_valves, width: 420, data: {src: 'data/images/valves.svg'}, css: 'no-borders'},
                                    {template: img_valves_status, width: 70, data: {src: 'data/images/valves-status.svg'}, css: 'no-borders'}
                                  ]
                                },
                                {template: img, width: 440, data: {src: 'data/images/dosing-wagon.jpg'}, css: 'no-borders'}
                              ]
                            }
                          ]
                        },
                        /* {
                          cols: [
                            {label: _('Material availability:'), view: 'label', width: 145},
                            {label: _('Attend'), view: 'label', width: 55, css: 'green'}
                          ]
                        },
                        {
                          cols: [
                            {label: _('Amount of material:'), view: 'label', width: 145},
                            {label: _('Value'), view: 'label', width: 55, css: 'bold'}
                          ]
                        }, */
                        {
                          cols: [
                            {
                              cols: [
                                {label: _('cart1weigth'), view: 'label', width: 55},
                                {view: 'text', width: 70, height: 30, id: '_cart1weigth', readonly: true}
                              ]
                            },
                            {
                              cols: [
                                {label: _('_2cartsweigth'), view: 'label', width: 70},
                                {view: 'text', width: 70, height: 30, id: "___weight", readonly: true}
                              ]
                            },
                            {
                              cols: [
                                {label: _('cart2weigth'), view: 'label', width: 55},
                                {view: 'text', width: 70, height: 30, id: '_cart2weigth', readonly: true}
                              ]
                            }]
                        }]
                    },
                    {
                      width: 530,
                      rows: [
                        {
                          view: 'toolbar',
                          width: 499,
                          css: 'no-borders',
                          elements: [
                            {
                              rows: [
                                {
                                  cols:
                                    [
                                      {label: _('Dosing settings'), view: 'label', width: 165, css: 'grey'},
                                      {},
                                      {label: _('Shunting device / Hoist'), view: 'label', width: 305, css: 'grey'},
                                      {
                                        view: 'button',
                                        type: 'image',
                                        label: _(''),
                                        width: 40,
                                        image: 'sources/styles/ellipse.svg'
                                      }
                                    ]
                                },
                                {
                                  css: 'divider',
                                  rows: [
                                    {
                                      cols: [
                                        {width: 10},
                                        {
                                          view: 'switch',
                                          name: 'wagon_weighing',
                                          width: 220,
                                          labelAlign: 'left',
                                          labelPosition: 'right',
                                          label: _('Train/Wagon'),
                                          value: 1,
                                          labelWidth: 150
                                        },
                                        {},
                                        {
                                          view: 'button', value: _('Train settings'),
                                          width: 200, type: 'form',
                                          click: function () {

                                          }
                                        }
                                      ]
                                    },
                                    {height: 15}
                                  ]
                                },
                                {height: 10},
                                {
                                  cols: [
                                    {width: 10},
                                    {
                                      view: 'switch',
                                      name: 'wagon_weighing',
                                      width: 340,
                                      labelAlign: 'right',
                                      labelPosition: 'right',
                                      label: _('Manual valves control'),
                                      value: 1,
                                      labelWidth: 240
                                    },
                                    {},
                                    {
                                      view: 'icon', tooltip: _('Go to table view settings'),
                                      icon: 'wxi wxi-settings', popup: popUp,
                                      hidden: !access.table_configuration,
                                      click: function () {

                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          cols: [
                            {
                              rows: [
                                {height: 10},
                                {
                                  cols: [
                                    {
                                      css: 'no-borders',
                                      template: img2,
                                      width: 154,
                                      data: {src: 'data/images/wagon3.jpg'}
                                    },
                                    {width: 5}
                                  ]
                                },
                                {
                                  cols: [
                                    {},
                                    {
                                      cols: [
                                        {
                                          label: _('offset1side'),
                                          view: 'label',
                                          width: 15
                                        },
                                        {
                                          view: 'text',
                                          width: 70,
                                          height: 30,
                                          id: '_offset1side',
                                          readonly: true
                                        }
                                      ]
                                    },
                                    {
                                      cols: [
                                        {
                                          view: 'text',
                                          width: 70,
                                          height: 30,
                                          id: '_offset2side',
                                          readonly: true
                                        },
                                        {
                                          label: _('offset2side'),
                                          view: 'label',
                                          width: 17
                                        }
                                      ]
                                    },
                                    {}
                                  ]
                                }
                              ]
                            },
                            {
                              width: 364,
                              rows: [
                                {height: 10},
                                {
                                  id: 'graphic', view: 'd3-chart', css: 'no-borders', resize: true, url: 'data/flare.json',
                                  ready: function () {
                                    var margin = {top: 10, right: 20, bottom: 10, left: 20},
                                      width = this.$width - margin.left - margin.right,
                                      height = this.$height - margin.top - margin.bottom

                                    var formatNumber = d3.format('.4f')
                                    var color = d3.scale.category20c()

                                    var x = d3.scale.linear()
                                      .domain([-1, 1])
                                      .range([0, width])

                                    var y = d3.scale.linear()
                                      .domain([-1, 1])
                                      .range([height, 0])

                                    var ease

                                    var svg = d3.select(this.$view).append('svg')
                                      .attr('width', this.$width)
                                      .attr('height', this.$height)
                                      .append('g')
                                      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

                                    svg.append('g')
                                      .attr('class', 'axis axis--x')
                                      .attr('transform', 'translate(0,' + height / 2 + ')')
                                      .call(d3.svg.axis()
                                        .scale(x)
                                        .orient('middle'))
                                      .append('text')
                                      .attr('x', width)
                                      .attr('y', -3)
                                      .attr('dy', '-.35em')
                                      .style('font-weight', 'bold')
                                      .style('text-anchor', 'middle')

                                    svg.append('g')
                                      .attr('class', 'axis axis--y')
                                      .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')
                                      .call(d3.svg.axis()
                                        .scale(y)
                                        .orient('left'))
                                      .append('text')
                                      .attr('x', 6)
                                      .attr('dy', '.35em')
                                      .style('font-weight', 'bold')

                                    var lineEase = svg.append('path')
                                      .attr('class', 'line')
                                      .style('stroke', '#000')
                                      .style('stroke-width', '1.5px')

                                    var circle = svg.append('circle')
                                      .attr('r', 7)
                                      .attr('cx', 0)
                                      .attr('cy', height)
                                      .style('fill', '#000000')

                                    referenceView.app.attachEvent('changePointColorBlack', function () {
                                      circle.style('fill', '#000000')
                                    })
                                    referenceView.app.attachEvent('changePointColorRed', function () {
                                      circle.style('fill', '#b3000c')
                                    })

                                    var timer

                                    referenceView.app.attachEvent('chartStaticWagonUpdateStop', function () {
                                      staticWagonTimer = false
                                      clearInterval(timer)
                                    })

                                    referenceView.app.attachEvent('chartStaticWagonUpdateStart', function () {
                                      var timeout = 1000 / config.counts
                                      staticWagonTimer = true
                                      timer = setInterval(function () {
                                        var _x = $$('_x').getValue()
                                        var _y = $$('_y').getValue()
                                        if (isNaN(_x) || _x === undefined || _x === '') _x = 0
                                        if (isNaN(_y) || _y === undefined || _y === '') _y = 0
                                        if (staticWagonTimer && weighingConfiguration.dynamichidden) circle.attr('cx', x(_x)).attr('cy', y(_y))
                                      }, timeout)
                                    })
                                    referenceView.app.callEvent('chartStaticWagonUpdateStop')
                                    referenceView.app.callEvent('chartStaticWagonUpdateStart')
                                  }
                                },
                                {
                                  cols: [
                                    {
                                      cols: [
                                        {
                                          label: _('offset_lengthwise'),
                                          view: 'label',
                                          width: 110
                                        },
                                        {
                                          view: 'text',
                                          width: 60,
                                          height: 30,
                                          id: '_offset_lengthwise',
                                          readonly: true
                                        },
                                        {
                                          view: 'text',
                                          minWidth: 80,
                                          height: 30,
                                          id: '_x',
                                          hidden: true,
                                          value: 0
                                        },
                                        {
                                          view: 'text',
                                          minWidth: 80,
                                          height: 30,
                                          id: '_truck_diff',
                                          hidden: true,
                                          value: 0
                                        }
                                      ]
                                    },
                                    {
                                      cols: [
                                        {
                                          label: _('cross_offset'),
                                          view: 'label',
                                          width: 100
                                        },
                                        {
                                          view: 'text',
                                          width: 60,
                                          height: 30,
                                          id: '_cross_offset',
                                          readonly: true
                                        },
                                        {
                                          view: 'text',
                                          minWidth: 80,
                                          height: 30,
                                          id: '_y',
                                          hidden: true,
                                          value: 0
                                        },
                                        {
                                          view: 'text',
                                          minWidth: 80,
                                          height: 30,
                                          id: '_side_diff',
                                          hidden: true,
                                          value: 0
                                        }
                                      ]
                                    }]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      rows: [
                        {
                          view: 'toolbar',
                          css: 'no-borders',
                          elements: [
                            {
                              rows: [
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'button', value: _('Cameras'),
                                      width: 150, type: 'form',
                                      click: function () {

                                      }
                                    },
                                    {}
                                  ]
                                },
                                {
                                  label: _('Lights'),
                                  view: 'label',
                                  minWidth: 140
                                },
                                {
                                  height: 176,
                                  cols: [
                                    {
                                      css: 'no-borders',
                                      template: img_lights,
                                      width: 154,
                                      data: {src: 'data/images/lights.svg'}
                                    },
                                    {width: 5}
                                  ]
                                },
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'button',
                                      type: 'image',
                                      label: _('Stop'),
                                      width: 130,
                                      image: 'sources/styles/stop.svg'
                                    },
                                    {}
                                  ]},
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'button',
                                      type: 'image',
                                      label: _('Forward'),
                                      width: 130,
                                      image: 'sources/styles/forward.svg'
                                    },
                                    {}
                                  ]
                                },
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'button',
                                      type: 'image',
                                      label: _('Backward'),
                                      width: 130,
                                      image: 'sources/styles/backward.svg'
                                    },
                                    {}
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {}
                      ]
                    },
                    {}
                  ]
                },
                {
                  view: 'toolbar', css: theme,
                  elements: [
                    {
                      hidden: true,
                      view: 'button',
                      type: 'iconButton',
                      icon: 'wxi wxi-undo',
                      width: 105,
                      label: _('Undo'),
                      click: function () {
                        $$('static_operations_wagon').undo()
                      }
                    },
                    {
                      view: 'button',
                      value: _('Set zero weights'),
                      autowidth: true,
                      type: 'form',
                      click: function () {
                        if (config.configuration.weighing_allowed) {
                          var _weigth = parseInt($$('___weight').getValue())
                          setZero(_weigth)
                        } else {
                          webix.message({type: 'error', text: _('Weighing is not allowed')})
                        }
                      }
                    },
                    {},
                    {
                      view: 'button',
                      value: _('Start dosing'),
                      id: 'button_set_weigth',
                      width: 200,
                      css: 'bt_1',
                      click: function () {
                        if (config.configuration.weighing_allowed) {
                          var item = $$(table).getSelectedItem()
                          if (item === undefined) {
                            var width = $$('button_set_weigth').getTopParentView()['$width'] / 2 + 60
                            var heigth = $$('button_set_weigth').getTopParentView()['$height'] / 2 - 100
                            wagonNumberWindow.setPosition(width, heigth)
                            wagonNumberWindow.show()
                            $$(numberOfWagon).$view.querySelector('input').focus()
                          } else {
                            if ($$('taraControl').getValue() === 1) {
                              setWeigth(item.wagon_number)
                            } else {
                              if (item.brutto === '' || item.brutto === undefined || item.brutto === null) {
                                updateWeight(item.id, item.wagon_number)
                              } else {
                                webix.message({type: 'error', text: _('BRUTTO is already set')})
                                $$(table).unselectAll()
                              }
                            }
                          }
                        } else {
                          webix.message({type: 'error', text: _('Weighing is not allowed')})
                        }
                      }
                    },
                    {},
                    {width: 3},
                    {
                      view: 'icon', tooltip: _('Go to table view settings'),
                      icon: 'wxi wxi-settings', popup: popUp,
                      hidden: !access.table_configuration,
                      click: function () {
                        getHidOptionsForConfigurator()
                      }
                    },
                    {width: 6}
                  ]
                }
              ]
            },
            StaticTActionsWagon
          ]
        }
      ]
    }

    return {
      type: 'wide', cols: [
        main
      ]
    }
  }

  ready () {
    const weighing = this.app.config.weighing;
    const _ = this.app.getService("locale")._;
    const ip = this.app.config.remoteHOST;
    const User = this.app.config.user;
    const Type = "static.wagon";

    this.app.callEvent('setExchange=nothing')
    this.app.callEvent('chartStaticUpdateStop')
    this.app.callEvent('chartStaticWagonUpdateStop')
    this.app.callEvent('chartStaticWagonUpdateStop')
    this.app.callEvent('chart3StaticCalibrationUpdateStop')
    this.app.callEvent('chart2StaticCalibrationUpdateStop')
    this.app.callEvent('chart1StaticCalibrationUpdateStop')
    this.app.callEvent('setExchange=nothing')
    this.app.callEvent('setMessage=Waiting')
    this.app.callEvent('chartWeighingDynamicClear')

    function closeCalibrationWindows () {
      try {
        var lockWindowName = $$('lockWindow').getValue()
        if ($$(lockWindowName).isVisible() === true) $$(lockWindowName).destructor()
      } catch (e) {
        // console.log(e);
      }
      try {
        var warningWindowName = $$('warningWindow').getValue()
        if ($$(warningWindowName).isVisible() === true) $$(warningWindowName).destructor()
      } catch (e) {
        // console.log(e);
      }
    }

    closeCalibrationWindows()

    this.app.callEvent("setExchange=nothing");
    if (weighing.current !== 3) {
      this.app.callEvent("setConnection=static.wagon");
      this.app.callEvent("connection");
    }
    this.app.callEvent("chart3StaticCalibrationUpdateStop");
    this.app.callEvent("chart2StaticCalibrationUpdateStop");
    this.app.callEvent("chart1StaticCalibrationUpdateStop");
  }
}
