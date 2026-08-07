/**
 * Copyright (c) Siemens 2016 - 2026
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

    const backgroundAccent = getProp(style, '--si-sys-background-accent');
    const backgroundAccentHover = getProp(style, '--si-sys-background-accent-hover');
    const background1 = getProp(style, '--si-sys-background-1');
    const backgroundNeutral = getProp(style, '--si-sys-background-neutral');
    const backgroundInverse = getProp(style, '--si-sys-background-inverse');
    const border1 = getProp(style, '--si-sys-border-1');
    const border3 = getProp(style, '--si-sys-border-3');
    const border4 = getProp(style, '--si-sys-border-4');
    const borderNeutral = getProp(style, '--si-sys-border-neutral');
    const borderAccent = getProp(style, '--si-sys-border-accent');
    const textPrimary = getProp(style, '--si-sys-text-primary');
    const textSecondary = getProp(style, '--si-sys-text-secondary');
    const textInverse = getProp(style, '--si-sys-text-inverse');
    const textDisabled = getProp(style, '--si-sys-text-disabled');

    // The order of colors is provided by ux.
    const colorPalettes = {
      default: [
        getProp(style, '--si-sys-data-categorial-1'),
        getProp(style, '--si-sys-data-categorial-2'),
        getProp(style, '--si-sys-data-categorial-4'),
        getProp(style, '--si-sys-data-categorial-6'),
        getProp(style, '--si-sys-data-categorial-5'),
        getProp(style, '--si-sys-data-categorial-7'),
        getProp(style, '--si-sys-data-categorial-8'),
        getProp(style, '--si-sys-data-categorial-9'),
        getProp(style, '--si-sys-data-categorial-11'),
        getProp(style, '--si-sys-data-categorial-12'),
        getProp(style, '--si-sys-data-categorial-13'),
        getProp(style, '--si-sys-data-categorial-16'),
        getProp(style, '--si-sys-data-categorial-17'),
        getProp(style, '--si-sys-data-categorial-3'),
        getProp(style, '--si-sys-data-categorial-10'),
        getProp(style, '--si-sys-data-categorial-14'),
        getProp(style, '--si-sys-data-categorial-15')
      ]
    };

    const gradientColors = {
      default: [
        getProp(style, '--si-sys-data-categorial-1'),
        getProp(style, '--si-sys-data-categorial-2')
      ]
    };

    const axisFontSize = 12;
    const axisLineHeight = 12;
    const axisLineColor = border4;

    const rootFontSizeRaw = getProp(style, 'font-size');
    const rootFontSize = rootFontSizeRaw.endsWith('px') ? parseInt(rootFontSizeRaw) : 16;

    // value based on body-2
    const fontSize = rootFontSize * 0.875;
    // diverging here by intention
    const lineHeight = fontSize;
    const textColor = textPrimary;

    const candlestickBull = colorPalettes.default[4];
    const candlestickBear = colorPalettes.default[12];

    const dataZoomFillerColor = echarts.color.modifyAlpha(backgroundNeutral, 0.2);
    const dataZoomBrushColor = backgroundAccent;
    const dataZoomAreaColor = backgroundNeutral;
    const dataZoomLineColor = border3;

    const dataZoomHandleIcon =
      'path://M-9.35,34.56V42m0-40V9.5m-2,0h4a2,2,0,0,1,2,2v21a2,2,0,0,1-2,2h-4a2,2,0,0,1-2-2v-21A2,2,0,0,1-11.35,9.5Z';
    const dataZoomHandleColor = borderAccent;

    const tooltipBackground = echarts.color.modifyAlpha(backgroundInverse, 0.8);

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
          color: textSecondary
        }
      },

      legend: {
        backgroundColor: 'transparent',
        inactiveColor: textDisabled,
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
          color: 'var(--si-sys-text-inverse)',
          fontWeight: 400
        },
        padding: [8, 12, 8, 12],
        axisPointer: {
          crossStyle: {
            color: border3,
            width: 1
          }
        },
        formatter: tooltipFormatter
      },

      axisPointer: {
        label: {
          fontFamily,
          color: textInverse,
          backgroundColor: border1,
          lineHeight: axisLineHeight,
          fontSize: axisFontSize
        },
        lineStyle: {
          color: border3,
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
          color: textSecondary
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
          color: textSecondary
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
          color: textSecondary
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
        borderColor: border4,
        fillerColor: dataZoomFillerColor,
        handleIcon: dataZoomHandleIcon,
        handleStyle: {
          color: dataZoomHandleColor,
          borderColor: border4
        },
        moveHandleStyle: {
          color: borderNeutral,
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
            color: backgroundAccentHover,
            opacity: 1
          },
          handleStyle: {
            color: backgroundAccentHover,
            borderColor: border4
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

      visualMap: {
        textStyle: {
          color: textColor
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
          color: textSecondary,
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
          distanceToLabelLine: 2,
          fontFamily,
          formatter: '{d}%',
          color: textSecondary,
          lineHeight,
          fontSize
        },
        labelLine: {
          length: 15,
          length2: 8,
          lineStyle: {
            color: textSecondary
          }
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: background1
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
          color: textPrimary,
          rich: {
            value: {
              color: textPrimary
            },
            unit: {
              color: textPrimary
            }
          }
        },
        axisLabel: {
          fontFamily,
          color: textPrimary
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
          grey: border4
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
          grey: border4,
          value: textPrimary,
          unit: textSecondary,
          defaultColor: borderAccent
        }
      }
    };
  }
};
