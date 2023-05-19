import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from jinja2 import Environment, FileSystemLoader


file1 = open('measure.out', 'r')
lines = file1.readlines()
file1.close()

SERIES = 100
REPETITIONS = 1000
jwt = [[] for i in range(2)]
paseto = [[] for i in range(2)]
fernet = [[] for i in range(2)]
branca = [[] for i in range(2)]
macaroon = [[] for i in range(2)]
opaque = [[] for i in range(2)]
none = [[] for i in range(2)]


def getList(token):
    if token == "JWT":
        return jwt
    elif token == "PASETO":
        return paseto
    elif token == "Fernet":
        return fernet
    elif token == "Branca":
        return branca
    elif token == "Macaroon":
        return macaroon
    elif token == "Opaque":
        return opaque
    elif token == "NONE":
        return none


def typToIndex(typ):
    if typ == "Signin:":
        return 0
    elif typ == "Request:":
        return 1


for line in lines:
    sline = line.split(" ")
    if len(sline) > 5 or len(sline) < 3:
        continue
    typ = sline[0].strip()
    token = sline[1].strip()
    tokenid = int(sline[2].strip())
    time = sline[3].strip()

    getList(token)[typToIndex(typ)].append(time)


def makeBoxplot(data, tokens, filename, colors, whiskers=False):
    fig = plt.figure(figsize=(10, 7))

    # Creating axes instance
    ax = fig.add_axes([0, 0, 1, 1])

    meanlineprops = dict(linestyle='--', linewidth=1.5, color='purple')
    # Creating plot
    bp = ax.boxplot(data, patch_artist=True, showmeans=True,
                    meanline=True, meanprops=meanlineprops, notch=True, bootstrap=10000, showfliers=whiskers)

    # Making graph pretty
    for patch, color in zip(bp['boxes'], colors):
        patch.set_facecolor(color)

    for median in bp['medians']:
        median.set(color='#7F7F7F',
                   linewidth=2)

    for flier in bp['fliers']:
        flier.set(marker='o',
                  color='#e7298a',
                  alpha=0.5)

    ax.set_xticklabels(tokens)
    plt.grid(axis='y')

    fig.savefig(f'graphs/boxplot/{filename}',
                format='svg', bbox_inches='tight')
    plt.close()


def makeHistogram(data, tokens, filename, colors):
    fig, axs = plt.subplots(2, 3)
    fig.subplots_adjust(left=0.08, right=0.98, bottom=0.05, top=0.9,
                        hspace=0.4, wspace=0.3)
    count = 0
    for i in range(2):
        for j in range(3):
            localdata = data[count]

            # calculate number of bins using Freedman–Diaconis method
            q25, q75 = np.percentile(localdata, [25, 75])
            bin_width = 2 * (q75 - q25) * len(localdata) ** (-1/3)
            bins = round((localdata.max() - localdata.min()) / bin_width)

            axs[i, j].hist(localdata, bins=bins, histtype='bar',
                           stacked=True, label=tokens[count], color=colors[count])
            axs[i, j].set_title(tokens[count])
            count += 1

    fig.savefig(f'graphs/histogram/{filename}',
                format='svg', bbox_inches='tight')
    plt.close()


def makeLineWithAvg(data, tokens, filename, colors):
    fig = plt.figure(figsize=(20, 7))
    xpoints = [i for i in range(1000)]
    xlabels = [i for i in range(0, 1000, 25)]

    # set y axis limit
    ax = plt.gca()
    y = np.amax(data)
    if y < 700:
        ax.set_ylim([20, 200])

    for i in range(len(data)):
        # set x axis range and labels
        plt.xticks(xlabels, xlabels)

        # calculate moving average
        cumsum = np.cumsum(data[i])
        period = 50
        moving_aves = (cumsum[period:] - cumsum[:-period]) / period

        # plot moving average and data
        plt.plot(range(1000-period), moving_aves,
                 label=tokens[i]+' tredline', color=colors[i])
        plt.plot(xpoints, data[i], label=tokens[i],
                 color=colors[i], ls=':', linewidth=0.5)
    plt.legend()
    plt.grid(axis='y')

    fig.savefig(f'graphs/line/{filename}', format='svg', bbox_inches='tight')
    plt.close()


def makeLine(data, tokens, filename, colors, width=0.5, avg=False):
    fig = plt.figure(figsize=(20, 7))
    xpoints = [i for i in range(1000)]
    xlabels = [i for i in range(0, 1000, 25)]

    # set y axis limit
    ax = plt.gca()
    ymax = np.amax(data)
    if ymax < 700 and ymax > 200:
        ax.set_ylim([20, 200])

    if avg:
        ax.set_ylim([0, 60])
        width = 1.5

    for i in range(len(data)):
        # set x axis range and labels
        plt.xticks(xlabels, xlabels)

        # plot data
        label = tokens[i]
        if avg:
            label += ' ' + "{:.2f}".format(np.amax(data[i]))

        plt.plot(xpoints, data[i], label=label,
                 color=colors[i], linewidth=width)
    plt.legend()
    plt.grid(axis='y')

    fig.savefig(f'graphs/line/{filename}', format='svg', bbox_inches='tight')
    plt.close()


def makeLineOnlyAvg(data, tokens, filename, colors):
    fig = plt.figure(figsize=(20, 7))
    xpoints = [i for i in range(1000)]
    xlabels = [i for i in range(0, 1000, 25)]

    for i in range(len(data)):
        # set x axis range and labels
        plt.xticks(xlabels, xlabels)

        # calculate moving average
        cumsum = np.cumsum(data[i])
        period = 50
        moving_aves = (cumsum[period:] - cumsum[:-period]) / period

        # plot moving average
        plt.plot(range(1000-period), moving_aves,
                 label=tokens[i]+' tredline', color=colors[i])
    plt.legend()
    plt.grid(axis='y')

    fig.savefig(f'graphs/line/{filename}', format='svg', bbox_inches='tight')
    plt.close()


tokens = ["JWT", "PASETO", "Fernet", "Branca", "Macaroon", "Opaque", "NONE"]
tokensWithoutOpaque = ["JWT", "PASETO", "Fernet", "Branca", "Macaroon", "NONE"]

dataSignin = [np.array(getList(tokenlist)[0], dtype=np.float32)
              for tokenlist in tokens]
dataRequest = [np.array(getList(tokenlist)[1], dtype=np.float32)
               for tokenlist in tokens]
dataSigninWithoutOpaque = [np.array(getList(tokenlist)[0], dtype=np.float32)
                           for tokenlist in tokensWithoutOpaque]
dataRequestWithoutOpaque = [np.array(getList(tokenlist)[1], dtype=np.float32)
                            for tokenlist in tokensWithoutOpaque]

minusNoneSignin = []
for i, data in enumerate(dataSignin):
    if tokens[i] == "NONE":
        continue
    newdata = []
    for j, value in enumerate(data):
        newdata.append(value - dataSignin[6][j])
    minusNoneSignin.append(newdata)

minusNoneRequest = []
for i, data in enumerate(dataRequest):
    if tokens[i] == "NONE":
        continue
    newdata = []
    for j, value in enumerate(data):
        newdata.append(value - dataRequest[6][j])
    minusNoneRequest.append(newdata)

dataMinusNoneSignin = [np.array(data, dtype=np.float32)
                       for data in minusNoneSignin]
dataMinusNoneRequest = [np.array(data, dtype=np.float32)
                        for data in minusNoneRequest]
dataMinusNoneSigninWithoutOpaque = [np.array(data, dtype=np.float32)
                                    for data in minusNoneSignin[:-1]]
dataMinusNoneRequestWithoutOpaque = [np.array(data, dtype=np.float32)
                                     for data in minusNoneRequest[:-1]]

dataAvgsSigninWithoutOpaque = []
avg_none_signin = np.average(dataSignin[6])
for i, data in enumerate(dataSigninWithoutOpaque):
    if tokensWithoutOpaque[i] == "NONE":
        continue
    avg = np.average(data)
    dataAvgsSigninWithoutOpaque.append(
        [avg - avg_none_signin for j in range(1000)])

avg_none_request = np.average(dataRequest[6])
dataAvgsRequestWithoutOpaque = []
for i, data in enumerate(dataRequestWithoutOpaque):
    if tokensWithoutOpaque[i] == "NONE":
        continue
    avg = np.average(data)
    dataAvgsRequestWithoutOpaque.append(
        [avg - avg_none_request for j in range(1000)])

colors = ['#4472C4', '#ED7D31', '#767171',
          '#FFC000', '#00B0F0', '#FF0000', '#000000']
colorsWithoutOpaque = ['#4472C4', '#ED7D31', '#767171',
                       '#FFC000', '#00B0F0', '#000000']

# make boxplot
makeBoxplot(dataSignin, tokens, "signin_boxplot_allW.svg",
            whiskers=True, colors=colors)
makeBoxplot(dataRequest, tokens, "request_boxplot_allW.svg",
            whiskers=True, colors=colors)
makeBoxplot(dataSigninWithoutOpaque, tokensWithoutOpaque,
            "signin_boxplot_without_opaqueW.svg", whiskers=True, colors=colorsWithoutOpaque)
makeBoxplot(dataRequestWithoutOpaque, tokensWithoutOpaque,
            "request_boxplot_without_opaqueW.svg", whiskers=True, colors=colorsWithoutOpaque)

makeBoxplot(dataSignin, tokens, "signin_boxplot_all.svg", colors)
makeBoxplot(dataRequest, tokens, "request_boxplot_all.svg", colors)
makeBoxplot(dataSigninWithoutOpaque, tokensWithoutOpaque,
            "signin_boxplot_without_opaque.svg", colorsWithoutOpaque)
makeBoxplot(dataRequestWithoutOpaque, tokensWithoutOpaque,
            "request_boxplot_without_opaque.svg", colorsWithoutOpaque)

# make histograms
makeHistogram(dataSignin, tokens, "sigin_histogram_all.svg", colors=colors)
makeHistogram(dataRequest, tokens, "request_histogram_all.svg", colors=colors)

# make line charts
makeLine(dataSignin, tokens, "signin_line_all_noavg.svg", colors)
makeLine(dataRequest, tokens, "request_line_all_noavg.svg", colors)
makeLine(dataSigninWithoutOpaque, tokensWithoutOpaque,
         "signin_line_without_opaque_noavg.svg", colorsWithoutOpaque)
makeLine(dataRequestWithoutOpaque, tokensWithoutOpaque,
         "request_line_without_opaque_noavg.svg", colorsWithoutOpaque)

# line charts with moving average
makeLineWithAvg(dataSignin, tokens, "signin_line_all.svg", colors)
makeLineWithAvg(dataRequest, tokens, "request_line_all.svg", colors)
makeLineWithAvg(dataSigninWithoutOpaque, tokensWithoutOpaque,
                "signin_line_without_opaque.svg", colorsWithoutOpaque)
makeLineWithAvg(dataRequestWithoutOpaque, tokensWithoutOpaque,
                "request_line_without_opaque.svg", colorsWithoutOpaque)

# only moving average
makeLineOnlyAvg(dataMinusNoneSignin, tokens,
                "signin_line_minus_none.svg", colors)
makeLineOnlyAvg(dataMinusNoneRequest, tokens,
                "request_line_minus_none.svg", colors)
makeLineOnlyAvg(dataMinusNoneSigninWithoutOpaque, tokens,
                "signin_line_minus_none_without_opaque.svg", colors)
makeLineOnlyAvg(dataMinusNoneRequestWithoutOpaque, tokens,
                "request_line_minus_none_without_opaque.svg", colors)

# only constant average
makeLine(dataAvgsSigninWithoutOpaque, tokensWithoutOpaque,
         "signin_line_avg_without_opaque.svg", colorsWithoutOpaque, avg=True)
makeLine(dataAvgsRequestWithoutOpaque, tokensWithoutOpaque,
         "request_line_avg_without_opaque.svg", colorsWithoutOpaque, avg=True)

# Create html report
env = Environment(loader=FileSystemLoader('templates'))
template = env.get_template('htmltemplate.html')

html = template.render(
    repetitions=REPETITIONS,
    series=SERIES,
    signin_boxplot_allW='graphs/boxplot/signin_boxplot_allW.svg',
    request_boxplot_allW='graphs/boxplot/request_boxplot_allW.svg',
    signin_boxplot_without_opaqueW='graphs/boxplot/signin_boxplot_without_opaqueW.svg',
    request_boxplot_without_opaqueW='graphs/boxplot/request_boxplot_without_opaqueW.svg',
    signin_boxplot_without_opaque='graphs/boxplot/signin_boxplot_without_opaque.svg',
    request_boxplot_without_opaque='graphs/boxplot/request_boxplot_without_opaque.svg',
    signin_histogram_all='graphs/histogram/sigin_histogram_all.svg',
    request_histogram_all='graphs/histogram/request_histogram_all.svg',
    signin_line_all_noavg='graphs/line/signin_line_all_noavg.svg',
    request_line_all_noavg='graphs/line/request_line_all_noavg.svg',
    signin_line_all='graphs/line/signin_line_all.svg',
    request_line_all='graphs/line/request_line_all.svg',
    signin_line_without_opaque_noavg='graphs/line/signin_line_without_opaque_noavg.svg',
    request_line_without_opaque_noavg='graphs/line/request_line_without_opaque_noavg.svg',
    signin_line_without_opaque='graphs/line/signin_line_without_opaque.svg',
    request_line_without_opaque='graphs/line/request_line_without_opaque.svg',
    signin_line_minus_none='graphs/line/signin_line_minus_none.svg',
    request_line_minus_none='graphs/line/request_line_minus_none.svg',
    signin_line_minus_none_without_opaque='graphs/line/signin_line_minus_none_without_opaque.svg',
    request_line_minus_none_without_opaque='graphs/line/request_line_minus_none_without_opaque.svg',
    signin_line_avg_without_opaque='graphs/line/signin_line_avg_without_opaque.svg',
    request_line_avg_without_opaque='graphs/line/request_line_avg_without_opaque.svg',
)

with open('report.html', 'w') as f:
    f.write(html)
