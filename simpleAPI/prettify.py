file1 = open('measure.out', 'r')
lines = file1.readlines()
file1.close()

PARALEL = 5
count = 0
token = ''
csv = []
reqAvg = 0
reqMed = 0
signAvg = 0
signMed = 0
# Strips the newline character
for line in lines:
    count += 1
    if "Retrieved:" in line:
        token = line.split(" ")[4].strip()
    if "Request time" in line:
        reqAvg += float(line.split(" ")[4].strip())
        reqMed += float(line.split(" ")[7].strip())
        print(reqAvg, reqMed)
    if "Sign in time" in line:
        signAvg += float(line.split(" ")[5].strip())
        signMed += float(line.split(" ")[8].strip())
        print(signAvg, signMed)
        count += 1
        if count == PARALEL:
            print
            count = 0
            csv.append([token, reqAvg, reqMed, signAvg, signMed])
            reqAvg = 0
            reqMed = 0
            signAvg = 0
            signMed = 0
    print("Line{}: {} using token {}".format(count, line.strip(), token))
