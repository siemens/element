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
    const elementBase0 = getProp(style, '--element-base-0');
    const elementBase1 = getProp(style, '--element-base-1');
    const elementTextPrimary = getProp(style, '--element-text-primary');
    const elementTextSecondary = getProp(style, '--element-text-secondary');
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

      color: colorPalettes.default,
      gradientColor: gradientColors.default,
      backgroundColor: 'transparent',
      animationDuration: 700,

      title: {
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
            color: dataZoomLineColor
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
        feature: {
          dataZoom: {
            brushStyle: {
              color: dataZoomFillerColor
            }
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
        symbol: 'circle'
      },

      pie: {
        label: {
          fontFamily,
          formatter: '{d}%',
          color: elementTextSecondary,
          lineHeight,
          fontSize
        },
        labelLine: {
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
          grey: elementBase0,
          value: elementTextPrimary,
          unit: elementUi3,
          defaultColor: elementUi0
        }
      }
    };
  }
};
