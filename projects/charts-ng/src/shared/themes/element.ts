/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { echarts } from '../echarts.custom';

const getProp = (style: CSSStyleDeclaration, prop: string): string => {
  return style.getPropertyValue(prop);
};

const candleStickValues = ['open', 'close', 'lowest', 'highest'];

const tooltipFormatter = (p: object | object[]): string => {
  const params = Array.isArray(p) ? p : [p];
  const label: string = params[0]?.axisValueLabel ?? '';

  let html = label;
  for (const series of params) {
    const isCandle = series.componentSubType === 'candlestick';
    const isPie = series.componentSubType === 'pie';
    const useName = series.name != series.axisValue;
    const name = isPie
      ? series.data.name
      : useName
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          series.name || series.seriesName
        : series.seriesName;
    const valIndex = (series.encode.value ?? series.encode.y)[0];
    const value = isCandle
      ? ''
      : isPie
        ? series.percent + '%'
        : Array.isArray(series.value)
          ? series.value[valIndex]
          : series.value;

    html += '<div style="display: flex; align-items: center;">';
    html += series.marker?.replace('margin-right', 'margin-inline-end');
    html += `<span style="margin-inline: 4px 8px">${name}</span>`;
    html += `<span style="margin-inline-start: auto">${value}</span>`;
    html += '</div>';

    if (isCandle) {
      const miniMarker = `<span style="display:inline-block;vertical-align:middle;margin-inline:3px 8px;border-radius:4px;width:4px;height:4px;background:${series.color};"></span>`;
      for (let i = 0; i < candleStickValues.length; i++) {
        const v = candleStickValues[i];
        const idx = series.encode.y[i];
        html += '<div style="display: flex; align-items: center;">';
        html += miniMarker;
        html += `<span style="margin-inline-end: 8px">${v}</span>`;
        html += `<span style="margin-inline-start: auto">${series.value[idx]}</span>`;
        html += '</div>';
      }
    }
  }
  return html;
};

export const themeElement = {
  name: 'element',
  style: () => {
    const style = window.getComputedStyle(document.documentElement);

    const elementUi0 = getProp(style, '--element-ui-0');
    const elementUi0Hover = getProp(style, '--element-ui-0-hover');
    const elementUi1 = getProp(style, '--element-ui-1');
    const elementUi2 = getProp(style, '--element-ui-2');
    const elementUi3 = getProp(style, '--element-ui-3');
    const elementUi4 = getProp(style, '--element-ui-4');
    const elementBase1 = getProp(style, '--element-base-1');
    const elementTextPrimary = getProp(style, '--element-text-primary');
    const elementTextSecondary = getProp(style, '--element-text-secondary');
    const elementActionTextSecondary = getProp(style, '--element-action-secondary-text');
    const elementTextInverse = getProp(style, '--element-text-inverse');

    // The order of colors is provided by ux.
    const colorPalettes = {
      default: [
        getProp(style, '--element-data-1'), // $siemens-data-petrol,
        getProp(style, '--element-data-2'), // $siemens-data-turquoise-900,
        getProp(style, '--element-data-4'), // $siemens-data-turquoise-700,
        getProp(style, '--element-data-6'), // $siemens-data-interactive-coral-900,
        getProp(style, '--element-data-5'), // $siemens-data-royal-blue-500,
        getProp(style, '--element-data-7'), // $siemens-data-purple-700,
        getProp(style, '--element-data-8'), // $siemens-data-purple-900,
        getProp(style, '--element-data-9'), // $siemens-data-orchid-700,
        getProp(style, '--element-data-11'), // $siemens-data-plum-900,
        getProp(style, '--element-data-12'), // $siemens-data-plum-500
        getProp(style, '--element-data-13'), // $siemens-data-royal-blue-700,
        getProp(style, '--element-data-16'), // $siemens-data-sand-700,
        getProp(style, '--element-data-17'), // $siemens-data-deep-blue-700
        getProp(style, '--element-data-3'), // $siemens-data-green-700,
        getProp(style, '--element-data-10'), // $siemens-data-red-700,
        getProp(style, '--element-data-14'), // $siemens-data-orange-900,
        getProp(style, '--element-data-15') // $siemens-data-yellow-900,
      ]
    };

    const gradientColors = {
      default: [
        getProp(style, '--element-data-1'), // $siemens-data-petrol,
        getProp(style, '--element-data-2') // $siemens-data-turquoise-900,
      ]
    };

    const axisFontSize = 12;
    const axisLineHeight = 12;
    const axisLineColor = elementUi4;

    const rootFontSizeRaw = getProp(style, 'font-size');
    const rootFontSize = rootFontSizeRaw.endsWith('px') ? parseInt(rootFontSizeRaw) : 16;

    // value based on body-2
    const fontSize = rootFontSize * 0.875;
    // diverging here by intention
    const lineHeight = fontSize;
    const textColor = elementTextPrimary;

    const candlestickBull = colorPalettes.default[4];
    const candlestickBear = colorPalettes.default[12];

    const dataZoomFillerColor = echarts.color.modifyAlpha(elementUi4, 0.4);
    const dataZoomBrushColor = elementUi0;
    const dataZoomAreaColor = elementUi4;
    const dataZoomLineColor = elementUi2;

    const elementDownloadPath =
      'path://M377.33,424H134.67A46.72,46.72,0,0,1,88,377.33V308a12,12,0,0,1,24,0v69.33A22.7,22.7,0,0,0,134.67,400H377.33A22.7,22.7,0,0,0,400,377.33V308a12,12,0,0,1,24,0v69.33A46.72,46.72,0,0,1,377.33,424Z M351.15,212.85a12,12,0,0,0-17,0L268,279V100a12,12,0,0,0-24,0V279l-66.18-66.18a12,12,0,1,0-17,17l86.66,86.67.06.05c.27.26.54.5.82.74l.46.34.48.36c.18.12.37.22.55.33s.3.19.46.27l.56.27c.17.08.33.16.51.23s.36.14.55.21l.55.19a5.73,5.73,0,0,0,.56.14c.19.05.39.11.59.15l.63.09.53.08a11.63,11.63,0,0,0,2.36,0l.53-.08.64-.09.58-.15a5.73,5.73,0,0,0,.56-.14l.55-.19c.19-.07.37-.13.55-.21s.34-.15.51-.23l.56-.27c.16-.08.31-.18.46-.27s.37-.21.55-.33l.48-.36.46-.34c.28-.24.55-.48.82-.74l.06-.05,86.66-86.67A12,12,0,0,0,351.15,212.85Z';

    const elementRestorePath =
      'path://M256,156a12,12,0,0,0-12,12v96a12,12,0,0,0,6.63,10.73l64,32a12,12,0,0,0,10.74-21.46L268,256.58V168A12,12,0,0,0,256,156Z M411.91,208.2a12,12,0,0,0,12-12v-72a12,12,0,1,0-24,0v45.09A167.89,167.89,0,0,0,256,88C163.36,88,88,163.36,88,256s75.36,168,168,168A168,168,0,0,0,422.06,281.57a12,12,0,0,0-23.72-3.63A144,144,0,0,1,256,400c-79.4,0-144-64.6-144-144s64.6-144,144-144a144.55,144.55,0,0,1,124.83,72.2H339.91a12,12,0,0,0,0,24Z';

    const elementZoomInPath =
      'path://M347.07,330.09A139.37,139.37,0,0,0,380,240c0-77.2-62.8-140-140-140S100,162.8,100,240s62.8,140,140,140a139.42,139.42,0,0,0,90.1-32.93l61.41,61.42a12,12,0,0,0,17-17ZM124,240a116,116,0,1,1,199,81A11.25,11.25,0,0,0,321,323,115.94,115.94,0,0,1,124,240Z M288,228H252V192a12,12,0,0,0-24,0v36H192a12,12,0,0,0,0,24h36v36a12,12,0,0,0,24,0V252h36a12,12,0,0,0,0-24Z';

    const elementZoomBackPath =
      'path://m136,216c-6.63,0-12-5.37-12-12v-56c0-13.23,10.77-24,24-24h56c6.63,0,12,5.37,12,12s-5.37,12-12,12h-56v56c0,6.63-5.37,12-12,12Z m240,0c-6.63,0-12-5.37-12-12v-56h-56c-6.63,0-12-5.37-12-12s5.37-12,12-12h56c13.23,0,24,10.77,24,24v56c0,6.63-5.37,12-12,12Z m-172,172h-56c-13.23,0-24-10.77-24-24v-56c0-6.63,5.37-12,12-12s12,5.37,12,12v56h56c6.63,0,12,5.37,12,12s-5.37,12-12,12Z m160,0h-56c-6.63,0-12-5.37-12-12s5.37-12,12-12h56v-56c0-6.63,5.37-12,12-12s12,5.37,12,12v56c0,13.23-10.77,24-24,24Z';

    const elementDataViewPath =
      'path://M259.87,400H162.4a19.22,19.22,0,0,1-19.2-19.2V131.2A19.22,19.22,0,0,1,162.4,112h97.2v97.2a12,12,0,0,0,12,12h97.2v57.28a12,12,0,0,0,24,0V209.2q0-.6-.06-1.2c0-.29-.08-.58-.13-.86,0-.1,0-.2-.05-.3a8.28,8.28,0,0,0-.25-1l0-.13c-.1-.34-.23-.67-.36-1a.49.49,0,0,0,0-.11,9.3,9.3,0,0,0-.43-.9.77.77,0,0,0-.07-.16c-.15-.27-.31-.53-.47-.79l-.14-.22c-.16-.24-.33-.46-.51-.69l-.19-.26a10.41,10.41,0,0,0-.71-.78l-.07-.09L280.09,91.51l-.09-.07a10.41,10.41,0,0,0-.78-.71l-.25-.19c-.23-.18-.46-.35-.7-.51l-.22-.14c-.26-.16-.52-.32-.79-.47l-.15-.07c-.3-.16-.6-.3-.91-.43l-.09,0c-.33-.13-.67-.25-1-.36l-.11,0a9.09,9.09,0,0,0-1-.25l-.29,0c-.29,0-.58-.1-.87-.13S272,88,271.6,88H162.4a43.25,43.25,0,0,0-43.2,43.2V380.8A43.25,43.25,0,0,0,162.4,424h97.47a12,12,0,0,0,0-24ZM283.6,129l68.23,68.23H283.6Z M347,296.4a73,73,0,1,0,73,73A73.09,73.09,0,0,0,347,296.4Zm0,128a55,55,0,1,1,55-55A55.06,55.06,0,0,1,347,424.4Z M376.62,374.15,356,363.84V331a9,9,0,0,0-18,0v38.4a9,9,0,0,0,5,8.05l25.6,12.8a9,9,0,1,0,8.05-16.1Z M302.71,256.52a12,12,0,0,0-12-12h-120a12,12,0,0,0,0,24h120A12,12,0,0,0,302.71,256.52Z M170.71,284.6a12,12,0,0,0,0,24h73.51a12,12,0,1,0,0-24Z';

    const dataZoomHandleIcon =
      'path://M-9.35,34.56V42m0-40V9.5m-2,0h4a2,2,0,0,1,2,2v21a2,2,0,0,1-2,2h-4a2,2,0,0,1-2-2v-21A2,2,0,0,1-11.35,9.5Z';
    const dataZoomHandleColor = elementUi0;

    const tooltipBackground = echarts.color.modifyAlpha(elementUi1, 0.8);

    const rtl = style.direction === 'rtl';

    // For E2E testing to get rid of font-loading instability.
    const fontFamily = navigator.webdriver ? 'sans-serif' : undefined;

    return {
      textStyle: {
        fontFamily
      },
      richInheritPlainLabel: false,
      color: colorPalettes.default,
      gradientColor: gradientColors.default,
      backgroundColor: 'transparent',
      animationDuration: 700,

      title: {
        left: 0,
        top: 0,
        padding: [10, 0, 0, 10],
        textStyle: {
          fontFamily,
          lineHeight,
          fontSize,
          color: textColor
        },
        subtextStyle: {
          fontFamily,
          lineHeight,
          fontSize,
          color: elementTextSecondary
        }
      },

      legend: {
        backgroundColor: 'transparent',
        inactiveColor: elementUi3,
        left: 'auto',
        right: 20,
        top: 35,
        itemGap: 10,
        textStyle: {
          fontFamily,
          color: textColor,
          lineHeight,
          fontSize
        },
        icon: 'circle',
        pageTextStyle: {
          color: textColor
        },
        itemStyle: {
          borderWidth: 0,
          itemGap: 12
        }
      },

      tooltip: {
        borderWidth: 0,
        backgroundColor: tooltipBackground,
        textStyle: {
          fontFamily,
          color: 'var(--element-text-inverse)',
          fontWeight: 400
        },
        padding: [8, 12, 8, 12],
        axisPointer: {
          crossStyle: {
            color: elementUi3,
            width: 1
          }
        },
        formatter: tooltipFormatter
      },

      axisPointer: {
        label: {
          fontFamily,
          color: elementTextInverse,
          backgroundColor: elementUi1,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize
        },
        lineStyle: {
          color: elementUi3,
          width: 2
        },
        handle: {
          color: 'rgba(0,0,0,0)',
          margin: 0
        }
      },

      grid: {
        top: 85,
        left: 32,
        right: 32,
        bottom: 30,
        containLabel: true
      },

      valueAxis: {
        nameTextStyle: {
          fontFamily,
          color: elementTextSecondary
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor
          }
        },
        axisLabel: {
          fontFamily,
          color: textColor,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize,
          hideOverlap: true
        },
        axisTick: {
          alignWithLabel: true
        },
        splitLine: {
          lineStyle: {
            color: axisLineColor
          }
        }
      },
      timeAxis: {
        inverse: rtl,
        nameTextStyle: {
          fontFamily,
          color: elementTextSecondary
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor
          }
        },
        axisLabel: {
          fontFamily,
          color: textColor,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize,
          hideOverlap: true
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        },
        splitLine: {
          lineStyle: {
            color: axisLineColor
          }
        }
      },
      categoryAxis: {
        inverse: rtl,
        nameTextStyle: {
          fontFamily,
          color: elementTextSecondary
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor
          }
        },
        axisLabel: {
          fontFamily,
          color: textColor,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize,
          hideOverlap: true
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        },
        splitLine: {
          lineStyle: {
            color: axisLineColor
          }
        }
      },

      dataZoom: {
        textStyle: {
          fontFamily,
          color: textColor,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize
        },
        borderColor: elementUi4,
        fillerColor: dataZoomFillerColor,
        handleIcon: dataZoomHandleIcon,
        handleStyle: {
          color: dataZoomHandleColor,
          borderColor: elementUi4
        },
        moveHandleStyle: {
          color: elementUi4,
          opacity: 1
        },
        brushStyle: {
          color: dataZoomBrushColor
        },
        dataBackground: {
          areaStyle: {
            color: dataZoomAreaColor
          },
          lineStyle: {
            color: dataZoomLineColor
          }
        },
        selectedDataBackground: {
          areaStyle: {
            color: dataZoomLineColor,
            opacity: 0.2
          },
          lineStyle: {
            color: dataZoomLineColor
          }
        },
        emphasis: {
          moveHandleStyle: {
            color: elementUi0Hover,
            opacity: 1
          },
          handleStyle: {
            color: elementUi0Hover,
            borderColor: elementUi4
          }
        }
      },

      toolbox: {
        itemSize: 14,
        showTitle: false,
        iconStyle: {
          borderColor: elementActionTextSecondary,
          borderWidth: 0,
          color: elementActionTextSecondary,
          shadowBlur: 0,
          opacity: 1
        },
        emphasis: {
          iconStyle: {
            borderColor: elementUi0,
            borderWidth: 0.5,
            shadowBlur: 0,
            color: elementUi0,
            opacity: 1
          }
        },

        feature: {
          dataZoom: {
            icon: {
              zoom: elementZoomInPath,
              back: elementZoomBackPath
            },
            brushStyle: {
              color: dataZoomFillerColor
            }
          },
          saveAsImage: {
            show: true,
            icon: elementDownloadPath
          },
          restore: {
            show: true,
            title: 'Reset',
            icon: elementRestorePath
          },
          dataView: {
            show: true,
            title: 'Data View',
            icon: elementDataViewPath,
            readOnly: true
          }
        }
      },

      // different chart types
      graph: {
        color: colorPalettes.default
      },

      bar: {
        barGap: 0,
        label: {
          fontFamily,
          color: elementTextSecondary,
          fontSize
        }
      },

      line: {
        areaStyle: {
          opacity: 0.3
        },
        symbol: 'circle',
        symbolSize: 4
      },

      pie: {
        radius: [0, '75%'],
        label: {
          fontFamily,
          formatter: '{d}%',
          color: elementTextSecondary,
          lineHeight,
          fontSize
        },
        labelLine: {
          length2: 15,
          lineStyle: {
            color: elementTextSecondary
          }
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: elementBase1
        }
      },

      candlestick: {
        itemStyle: {
          color: candlestickBull,
          color0: candlestickBear,
          borderColor: candlestickBull,
          borderColor0: candlestickBear
        }
      },

      gauge: {
        detail: {
          color: elementTextPrimary,
          rich: {
            value: {
              color: elementTextPrimary
            },
            unit: {
              color: elementTextPrimary
            }
          }
        },
        axisLabel: {
          fontFamily,
          color: elementTextPrimary
        },
        axisTick: {
          lineStyle: {
            color: axisLineColor
          }
        },
        splitLine: {
          lineStyle: {
            color: axisLineColor
          }
        }
      },

      sankey: {
        label: {
          fontFamily,
          textBorderColor: 'transparent',
          color: textColor
        }
      },
      sunburst: {
        label: {
          fontFamily,
          textBorderColor: 'transparent',
          color: textColor
        }
      },

      simpl: {
        colorPalettes,

        dataZoom: {
          options: {
            height: 36,
            bottom: 20
          },
          grid: {
            bottom: 80
          }
        },

        timeRangeBar: {
          height: 32
        },

        externalZoomSlider: {
          grid: {
            bottom: 10
          }
        },

        legendLeft: {
          left: 10,
          width: '45%'
        },
        legendRight: {
          right: 20,
          width: '45%'
        },

        noTitle: {
          grid: {
            top: 60
          },
          legend: {
            top: 15
          }
        },

        subTitle: {
          grid: {
            top: 110
          },
          legend: {
            top: 65
          }
        },

        customLegend: {
          grid: {
            top: 64
          }
        },

        progress: {
          itemWidth: 6,
          itemGap: 6,
          grey: elementUi4
        },

        progressBar: {
          labelColor: textColor,
          itemWidth: 20,
          grid: {
            left: 16,
            right: 52,
            containLabel: true
          }
        },

        gauge: {
          grey: elementUi4,
          value: elementTextPrimary,
          unit: elementTextSecondary,
          defaultColor: elementUi0
        }
      }
    };
  }
};
