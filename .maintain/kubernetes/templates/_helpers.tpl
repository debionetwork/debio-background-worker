{{/*
Expand the name of the chart.
*/}}
{{- define "debio-indexer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "debio-indexer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "debio-indexer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "debio-indexer.labels" -}}
helm.sh/chart: {{ include "debio-indexer.chart" . }}
{{ include "debio-indexer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "debio-indexer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "debio-indexer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "debio-indexer.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "debio-indexer.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of elastic Search secret.
*/}}
{{- define "debio-indexer.elasticSearchSecretName" -}}
{{- printf "%s-%s" (include "debio-indexer.fullname" .) "elastic-search" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of minimal Starting Block secret.
*/}}
{{- define "debio-indexer.minimalStartingBlockSecretName" -}}
{{- printf "%s-%s" (include "debio-indexer.fullname" .) "minimal-block" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of minimal Starting Block secret.
*/}}
{{- define "debio-indexer.requestServiceContractAddressSecretName" -}}
{{- printf "%s-%s" (include "debio-indexer.fullname" .) "req-svc-contract-address" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of minimal substrate Url secret.
*/}}
{{- define "debio-indexer.substrateUrlSecretName" -}}
{{- printf "%s-%s" (include "debio-indexer.fullname" .) "substrate-url" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of minimal web3 Rpc Block secret.
*/}}
{{- define "debio-indexer.web3RpcSecretName" -}}
{{- printf "%s-%s" (include "debio-indexer.fullname" .) "web-rpc" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}
