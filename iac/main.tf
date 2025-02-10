module "video-service" {
  source = "./modules/generic"

  project_name              = "video-service"
  create_aws_ecr_repository = true
}
