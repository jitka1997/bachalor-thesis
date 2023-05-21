file1 = open('measure.out', 'r')
lines = file1.readlines()
file1.close()

PARALEL = 5
REPETITIONS = 1000
jwt = [[] for i in range(PARALEL)]
paseto = [[] for i in range(PARALEL)]
fernet = [[] for i in range(PARALEL)]
branca = [[] for i in range(PARALEL)]
macaroon = [[] for i in range(PARALEL)]
opaque = [[] for i in range(PARALEL)]
none = [[] for i in range(PARALEL)]


def getList(token, typ):
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


for line in lines:
    sline = line.split(" ")
    if len(sline) > 5 or len(sline) < 3:
        continue
    typ = sline[0].strip()
    if typ == "Request:":
        continue
    token = sline[1].strip()
    tokenid = int(sline[2].strip())
    time = sline[3].strip()

    getList(token, typ)[tokenid].append(time)

tokens = ["JWT", "PASETO", "Fernet", "Branca", "Macaroon", "Opaque", "NONE"]
csv = []
for i in range(REPETITIONS):
    if i == 0:
        csvline = ""
        for token in tokens:
            for j in range(PARALEL):
                csvline += token + " " + str(j) + ", "
        csv.append(csvline)
    csvline = ""
    for token in tokens:
        for j in range(PARALEL):
            if len(getList(token, "Request:")[j]) > i:
                csvline += str(getList(token, "Request:")[j][i]) + ", "
            else:
                csvline += "-1, "
    csv.append(csvline)

with open('measure.csv', 'w') as f:
    for item in csv:
        f.write("%s\n" % item)
